import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ActionPerformed,
  PushNotifications,
  PushNotificationSchema,
  Token,
} from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  private http = inject(HttpClient);

  private firebaseToken;
  private associated = false;
  private _registered = new BehaviorSubject<boolean>(false); // has firebaseToken

  public pushReceived$ = new Subject<PushNotificationSchema>();
  public pushAction$ = new Subject<ActionPerformed>();
  public registered$ = this._registered.asObservable();

  public isRegistered() {
    return this._registered.getValue();
  }

  // use on app start
  private setLocalToken(firebaseToken: string) {
    this.firebaseToken = firebaseToken;
    this._registered.next(true);
  }

  // use after login
  public async userAssociate() {
    if (!this.firebaseToken || this.associated) return;
    this.associated = true;

    await lastValueFrom(
      this.http.post(environment.urlApi + '/users/device-token', {
        token: this.firebaseToken,
      }),
    );
  }

  // use after logout
  public async userDissociate() {
    if (!this.firebaseToken || !this.associated) return;

    await lastValueFrom(
      this.http.delete<any>(
        `${environment.urlApi}/users/device-token/${this.firebaseToken}`,
      ),
    );

    this.associated = false;
  }

  async showLocal(notification) {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: notification.title,
          body: notification.body,
          id: 1,
          schedule: { at: new Date(Date.now() + 1000) },
          sound: null,
          attachments: null,
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  }

  // use on app start
  public async start() {
    // add listeners
    await PushNotifications.addListener('registration', (token: Token) => {
      this.setLocalToken(token.value);
    });

    await PushNotifications.addListener('registrationError', (error: any) =>
      console.log('push registration error', JSON.stringify(error)),
    );

    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        this.pushReceived$.next(notification);
        this.showLocal(notification);
      },
    );

    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => this.pushAction$.next(notification),
    );

    // register device
    await this.firebaseRegister();
  }

  private async permissions(): Promise<boolean> {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt')
      permStatus = await PushNotifications.requestPermissions();

    return permStatus.receive === 'granted';
  }

  private async firebaseRegister() {
    const perm = await this.permissions();
    if (!perm || this.firebaseToken) return;

    await PushNotifications.register();
  }
}
