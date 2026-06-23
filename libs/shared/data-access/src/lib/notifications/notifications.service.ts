import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '@trokai/shared-core';
import { BehaviorSubject, Subject, lastValueFrom } from 'rxjs';
import { NotificationsResponse } from './notifications.models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);
  private urlApi = inject(APP_CONFIG).urlApi;

  private _notReadCount = new BehaviorSubject<number>(0);
  public resetNotif = new Subject<void>(); // app: limpa página ao deslogar

  get notReadedCount$() {
    return this._notReadCount.asObservable();
  }

  async fetchNotifications(skip: number): Promise<NotificationsResponse> {
    const res = await lastValueFrom(
      this.http.get<NotificationsResponse>(
        `${this.urlApi}/users/notifications?skip=${skip}&limit=${20}`,
      ),
    );
    this._notReadCount.next(res.meta.unread_count);
    return res;
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

  async markOneRead(id: string) {
    await lastValueFrom(
      this.http.patch(`${this.urlApi}/users/notifications/${id}/read`, {}),
    );
    this._notReadCount.next(Math.max(0, this._notReadCount.getValue() - 1));
  }

  reset() {
    this._notReadCount.next(0);
    this.resetNotif.next();
  }
}
