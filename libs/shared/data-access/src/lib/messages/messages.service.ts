import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG, NavigationManager } from '@trokai/shared-core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Chat, Message, NegotiationType } from './messages.models';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private http = inject(HttpClient);
  private urlApi = inject(APP_CONFIG).urlApi;
  private nav = inject(NavigationManager);

  private _chats = new BehaviorSubject<Chat[]>([]);
  private _notReadCount = new BehaviorSubject<number>(0);

  get chats$() {
    return this._chats.asObservable();
  }

  get notReadCount$() {
    return this._notReadCount.asObservable();
  }

  public async fetchChats() {
    try {
      if (!this.nav.isAuthenticated()) {
        this.reset();
        return;
      }

      const chats = await lastValueFrom(
        this.http.get<Chat[]>(`${this.urlApi}/users/chats`),
      );

      const current = this._chats.value;
      let changes = false;

      for (let i = 0; i < chats.length; i++) {
        if (
          !current[i] ||
          chats[i].lastMessage._id !== current[i].lastMessage._id
        ) {
          changes = true;
          break;
        }
      }

      if (changes || current.length !== chats.length) this._chats.next(chats);

      const notReadCount = chats.reduce((acc, c) => acc + c.unreadCount, 0);
      this._notReadCount.next(notReadCount);
    // eslint-disable-next-line no-empty
    } catch {}
  }

  public fetchNegotiationMessages(
    negotiationId: string,
    negotiationType: NegotiationType,
    lastMessageTime?: Date,
  ) {
    if (!this.nav.isAuthenticated()) return Promise.resolve<Message[]>([]);

    const params = {
      negotiationId,
      negotiationType,
      ...(lastMessageTime && { lastMessageTime: lastMessageTime.toString() }),
    };

    return lastValueFrom(
      this.http.get<Message[]>(`${this.urlApi}/users/messages`, { params }),
    );
  }

  public markAsRead(
    negotiationId: string,
    negotiationType: string,
    lastMessageTime: Date,
  ) {
    return lastValueFrom(
      this.http.patch(`${this.urlApi}/users/messages/read`, {
        negotiationId,
        negotiationType,
        lastMessageTime: lastMessageTime.toString(),
      }),
    );
  }

  public sendMessage(
    negotiationId: string,
    negotiationType: string,
    message: string,
  ) {
    return lastValueFrom(
      this.http.post<Message>(`${this.urlApi}/users/messages`, {
        message,
        negotiationId,
        negotiationType,
      }),
    );
  }

  /** quando deslogar, limpa tudo */
  public reset() {
    this._chats.next([]);
    this._notReadCount.next(0);
  }
}
