import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { ConnectivityService, User } from '@trokai/shared-core';
import {
  ChatEntry,
  ChatTimeDivider,
  Message,
  MessagesService,
  NegotiationType,
} from '@trokai/shared-data-access';

/**
 * Shared chat thread: the message list + composer for a negotiation. Owns all
 * messaging concerns — polling fetch, send, day-divider/time formatting, auto-scroll —
 * over the shared `MessagesService` and the abstract `ConnectivityService`. Platform
 * chrome (header, back/options, modal vs route) stays in the per-app shell that hosts it.
 */
@Component({
  selector: 'tk-chat-thread',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './tk-chat-thread.component.html',
  styleUrl: './tk-chat-thread.component.scss',
})
export class TkChatThreadComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid?: ElementRef<HTMLElement>;

  @Input() user!: User;
  @Input() otherUser: User | null = null;
  @Input() negotiationId: string | null = null;
  @Input() negotiationType: NegotiationType | null = null;
  @Input() enabled = true;

  messages: ChatEntry[] = [];
  message = '';

  networkConnected = true;
  private networkSub?: Subscription;

  lastTime: number | null = null;
  lastMessage: Message | null = null;
  pauseForSending = false;
  private fetchInterval: ReturnType<typeof setInterval> | null = null;

  private messagesService = inject(MessagesService);
  private connectivity = inject(ConnectivityService);

  get inputDisabled(): boolean {
    return !this.networkConnected || !this.enabled || this.otherUser?.status === 3;
  }

  get canSend(): boolean {
    return (
      this.networkConnected &&
      this.enabled &&
      !!this.message &&
      this.message.toString().trim().length > 0
    );
  }

  async ngOnInit() {
    this.networkSub = this.connectivity.connected$.subscribe(async (connected) => {
      if (!connected) {
        this.networkConnected = false;
      } else {
        if (!this.networkConnected) await this.refresh();
        this.networkConnected = true;
      }
    });

    await this.refresh();
    this.startInterval();
  }

  ngOnDestroy() {
    if (this.fetchInterval) clearInterval(this.fetchInterval);
    this.networkSub?.unsubscribe();
  }

  async refresh() {
    await this.fetchMessages();
  }

  enter() {
    this.createMessage();
  }

  private startInterval() {
    this.fetchInterval = setInterval(() => {
      if (this.networkConnected && !this.pauseForSending) this.fetchMessages();
    }, 5000);
  }

  private addMessage(m: Message) {
    if (this.needsTimeDiff(m)) {
      const divider: ChatTimeDivider = { timeDiff: true, senderId: m.senderId, text: m.dayLabel };
      this.messages.push(divider);
    }
    this.messages.push(m);
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.grid?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 300);
  }

  async fetchMessages() {
    const id = this.negotiationId;
    const type = this.negotiationType;
    if (!id || !type) return;

    const msgs = await this.messagesService.fetchNegotiationMessages(
      id,
      type,
      this.lastMessage?.createdAt,
    );

    msgs.reverse().forEach((m) => this.addMessage(m));

    const lastMsg = msgs[msgs.length - 1];

    if (lastMsg && lastMsg._id !== this.lastMessage?._id) {
      this.messagesService.markAsRead(id, type, lastMsg.createdAt);
    }

    this.lastMessage = lastMsg || this.lastMessage;
  }

  async createMessage() {
    const id = this.negotiationId;
    const type = this.negotiationType;
    if (!id || !type) return;
    if (!this.message || this.message.toString().trim().length === 0) return;
    if (!this.networkConnected) return;
    try {
      const msg = this.message;
      this.message = '';
      this.pauseForSending = true;

      const message = await this.messagesService.sendMessage(id, type, msg);

      this.lastMessage = message;
      this.addMessage(message);
    } catch {
      /* send failed — message stays cleared, polling will reconcile */
    } finally {
      this.pauseForSending = false;
    }
  }

  isTimeDivider(m: ChatEntry): m is ChatTimeDivider {
    return (m as ChatTimeDivider).timeDiff === true;
  }

  getMessageTime(item: ChatEntry): string {
    return (item as Message).timeFormatted;
  }

  needsTimeDiff(item: Message): boolean {
    const diff = item.dayDiff;
    if (diff === this.lastTime) return false;
    this.lastTime = diff;
    return true;
  }

  getTimeDiff(item: Message): string {
    return item.dayLabel;
  }
}
