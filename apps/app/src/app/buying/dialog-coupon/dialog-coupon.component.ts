import { User } from '@trokai/shared-core';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  LoadingController,
  ModalController,
  NavController,
  IonItem,
  IonHeader,
  IonContent,
  IonGrid,
  IonTitle,
  IonButton,
  IonLabel,
  IonInput,
  IonRadioGroup,
  IonRadio,
  IonRippleEffect,
  IonIcon,
  IonFooter,
  IonToolbar,
  IonButtons,
} from '@ionic/angular/standalone';
import {
  AddressOption,
  BuyingService,
  CheckoutLocal,
  Coupon,
} from '@trokai/shared-data-access';
import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { close, sadOutline } from 'ionicons/icons';
import { GlobalService } from 'src/app/services/global.service';
import { ToastService } from 'src/app/services/toast-service';
import { BackButtonComponent } from 'src/app/shared/components/back-button/back-button.component';
import { LoadingService } from '@trokai/shared-ui';

@Component({
  selector: 'app-dialog-coupon',
  templateUrl: './dialog-coupon.component.html',
  styleUrls: ['./dialog-coupon.component.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonToolbar,
    IonFooter,
    IonButton,
    IonTitle,
    IonContent,
    IonHeader,
    IonItem,
    IonInput,
    BackButtonComponent,
    FormsModule,
    IonIcon,
  ],
})
export class DialogCoupon implements OnInit {
  private modalCtrl = inject(ModalController);
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private buyingService = inject(BuyingService);
  private toastService = inject(ToastService);
  private globalService = inject(GlobalService);
  private loading = inject(LoadingService);
  private authService = inject(AuthService);

  checkoutLocal: CheckoutLocal;
  user: User;
  couponCode;

  async ngOnInit() {
    addIcons({ sadOutline, close });
    this.buyingService.checkoutLocal$.subscribe(
      (c) => (this.checkoutLocal = c),
    );
  }

  close() {
    if (this.router.url.includes('coupons')) this.navCtrl.back();
    else this.modalCtrl.dismiss();
  }

  async onApply() {
    if (!this.couponCode) return;

    try {
      this.loading.start('Validando cupom');
      this.checkoutLocal.couponCode = this.couponCode;
      this.buyingService.setCheckoutLocal(this.checkoutLocal);
      await this.buyingService.getCheckoutData();
      this.toastService.makeToast('Cupom de desconto aplicado!');
      this.modalCtrl.dismiss({ couponCode: this.couponCode });
    } catch {
      delete this.checkoutLocal.couponCode;
    } finally {
      this.loading.finish();
    }
  }
}
