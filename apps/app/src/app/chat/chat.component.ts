import { Component, OnInit, Input, inject } from '@angular/core';
import {
  TkUserAvatarComponent,
  TkChatThreadComponent,
} from '@trokai/shared-ui';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ReportUserDialogComponent } from 'src/app/shared/components/report-user/report-user-dialog.component';
import {
  ActionSheetController,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
  ModalController,
  Platform,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alert, close, ellipsisVertical } from 'ionicons/icons';
import { NgZone } from '@angular/core';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonIcon,
    IonContent,
    TkUserAvatarComponent,
    TkChatThreadComponent,
    BackButtonComponent,
  ],
})
export class ChatComponent implements OnInit {
  private actionSheetController = inject(ActionSheetController);
  private modalCtrl = inject(ModalController);
  private authService = inject(AuthService);
  private platform = inject(Platform);
  private ngZone = inject(NgZone);
  private dialog = inject(MatDialog);

  user;

  @Input() otherUser = null;
  @Input() negotiationType = null;
  @Input() negotiationId = null;
  @Input() enabled = true;

  backBtnMode = 'md';
  showStatus = true;

  ngOnInit() {
    addIcons({ ellipsisVertical, close, alert });
    if (this.platform.is('ios')) this.backBtnMode = 'ios';
    if (!this.otherUser) this.close();
    this.authService.user.pipe(take(1)).subscribe((u) => (this.user = u));
  }

  close() {
    this.modalCtrl.dismiss();
  }

  options() {
    this.actionSheetController
      .create({
        buttons: [
          {
            text: 'Denunciar usuário',
            icon: 'alert',
            handler: () => this.ngZone.run(() => this.report()),
          },
          {
            text: 'Cancelar',
            icon: 'close',
            role: 'cancel',
            handler: () => {
              /* intentional */
            },
          },
        ],
      })
      .then((ac) => ac.present());
  }

  report() {
    this.dialog.open(ReportUserDialogComponent, {
      data: { otherUser: this.otherUser },
    });
  }
}
