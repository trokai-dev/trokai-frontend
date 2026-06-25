import { User, FeedbackService } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
} from '@angular/core';
import { Chat, MessagesService } from '@trokai/shared-data-access';
import { AuthService } from '../auth/auth.service';
import { TkUserAvatarComponent } from '@trokai/shared-ui';
import { ShortDatePipe } from '@trokai/shared-ui';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [TkUserAvatarComponent, ShortDatePipe, NgClass],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss',
})
export class ChatListComponent implements OnInit {
  private messagesService = inject(MessagesService);
  private authService = inject(AuthService);
  private feedback = inject(FeedbackService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  chats: Chat[] = [];
  user!: User;

  ngOnInit(): void {
    this.messagesService.chats$.subscribe((chats) => (this.chats = chats));
    this.authService.user$.subscribe((u) => {
      if (u) this.user = u;
    });
  }

  openChat(chat: Chat) {
    // abre passando o chat
    if (chat.negotiationType === 'purchase')
      this.router.navigateByUrl(`/orders/purchases/${chat.negotiationId}/chat`);
    else if (chat.negotiationType === 'sale')
      this.router.navigateByUrl(`/orders/sales/${chat.negotiationId}/chat`);
    else this.feedback.error('Mensagem não encontrada');
  }
}
