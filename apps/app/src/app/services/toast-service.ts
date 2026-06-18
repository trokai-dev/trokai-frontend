import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastCtrl = inject(ToastController);

  makeToast(text, time?) {
    this.toastCtrl
      .create({
        message: text,
        duration: time ? time : 1500,
        position: 'bottom',
        animated: true,
        cssClass: 'myToast',
        color: 'medium',
      })
      .then((toast) => {
        toast.present();
      });
  }

  makeToastInternet(connected) {
    this.toastCtrl
      .create({
        message: connected ? 'Conectado' : 'Sem conexão',
        duration: 4000,
        animated: false,
        position: 'bottom',
        cssClass: 'myToast',
        color: 'medium',
      })
      .then((toast) => {
        toast.present();
      });
  }

  makeToastErrorDefault() {
    this.toastCtrl
      .create({
        message: 'Ops! Algo deu errado',
        duration: 1500,
        position: 'bottom',
        animated: false,

        cssClass: 'myToast',
        color: 'medium',
      })
      .then((toast) => {
        toast.present();
      });
  }
}
