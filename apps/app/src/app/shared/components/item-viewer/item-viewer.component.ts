import {
  Component,
  OnInit,
  Input,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';
import { InventoryService } from 'src/app/services/inventory.service';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs/operators';
import {
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonRippleEffect,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { Share } from '@capacitor/share';
import { NgClass, CurrencyPipe } from '@angular/common';
import { TkLikeButtonComponent } from '@trokai/shared-ui';
import { StatusPillComponent, ItemNamePipe, CostPipe } from '@trokai/shared-ui';
import { addIcons } from 'ionicons';
import { close, shareSocialSharp } from 'ionicons/icons';
import { FirebaseService } from 'src/app/services/firebase.service';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-item-viewer',
  templateUrl: './item-viewer.component.html',
  styleUrls: ['./item-viewer.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,

    IonHeader,
    IonToolbar,
    IonButtons,
    IonIcon,
    IonContent,
    TkLikeButtonComponent,
    NgClass,
    CurrencyPipe,
    CostPipe,
    IonRippleEffect,
    IonFooter,
    StatusPillComponent,
    ItemNamePipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemViewerComponent implements OnInit {
  @Input() product;
  @Input() owner;
  @Input() canFavorite = true;
  @Input() canEdit = false;
  @Input() canShare = false;
  @Input() buying = false;
  @Input() inCart = false;

  inventoryService = inject(InventoryService);
  private modalCtrl = inject(ModalController);
  private authService = inject(AuthService);
  private globalService = inject(GlobalService);
  private firebaseService = inject(FirebaseService);

  constructor() {
    addIcons({ close, shareSocialSharp });
  }

  user;

  ngOnInit() {
    this.authService.user.pipe(take(1)).subscribe((u) => {
      this.user = u;
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  clickAdd() {
    this.modalCtrl.dismiss({ clickAdd: true });
  }

  clickRemove() {
    this.modalCtrl.dismiss({ clickRemove: true });
  }

  async share() {
    let text = '';

    text = this.product.title + '. Veja essa peça no Trokaí';

    await Share.share({
      title: this.product.title,
      text: text,
      url:
        'https://www.trokai.com.br' +
        this.globalService.mountProductLink(this.product),
      dialogTitle: 'Compartilhar peça',
    });

    if (this.owner._id === this.user._id) {
      this.firebaseService.log('SHARE_ROUPA_USER');
    } else {
      this.firebaseService.log('SHARE_ROUPA_OUTRO');
    }
  }
}
