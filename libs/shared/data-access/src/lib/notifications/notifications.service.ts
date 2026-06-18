import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '@trokai/shared-core';
import { BehaviorSubject, Subject, lastValueFrom } from 'rxjs';
import { NotificationModel } from './notifications.models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);
  private urlApi = inject(APP_CONFIG).urlApi;

  private _notReadCount = new BehaviorSubject<number>(0);
  public resetNotif = new Subject<void>(); // app: limpa página ao deslogar

  get notReadedCount$() {
    return this._notReadCount.asObservable();
  }

  fetchNotifications(skip: number) {
    return lastValueFrom(
      this.http.get<NotificationModel[]>(
        `${this.urlApi}/users/notifications?skip=${skip}&limit=${20}`,
      ),
    );
  }

  async fetchUnreadCount() {
    const res = await lastValueFrom(
      this.http.get<{ unread: number }>(
        `${this.urlApi}/users/notifications/unread`,
      ),
    );
    this._notReadCount.next(res.unread);
  }

  async markAsRead() {
    if (!this._notReadCount.getValue()) return;
    await lastValueFrom(
      this.http.patch(`${this.urlApi}/users/notifications/read`, {}),
    );
    this._notReadCount.next(0);
  }

  reset() {
    this._notReadCount.next(0);
    this.resetNotif.next();
  }
}
