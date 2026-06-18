import { User } from '@trokai/shared-core';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserReviewsDialogComponent } from '../modules/reviews/user-reviews-dialog/user-reviews-dialog.component';
import { DownloadModalComponent } from '../download-modal/download-modal.component';
import { Overlay } from '@angular/cdk/overlay';
import { TkFeesCalculatorComponent as FeesCalculatorComponent } from '@trokai/shared-ui';
import { OpenAppDialogComponent } from '../open-app-dialog/open-app-dialog.component';
import { ExitPopupComponent } from '../exit-popup/exit-popup.component';
import { CheckoutValues, Coupon } from '@trokai/shared-data-access';
import { CheckoutTotalDetailsComponent } from '../buying/checkout/checkout-total-details/checkout-total-details.component';
import { CouponInfoDialogComponent } from '../coupon-info-dialog/coupon-info-dialog.component';
import { TkQuestionsSecurityDialogComponent } from '@trokai/shared-ui';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { PhoneVerifyDialogComponent } from '@trokai/shared-ui';
import { AuthService } from '../auth/auth.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialog = inject(MatDialog);
  private overlay = inject(Overlay);
  private authService = inject(AuthService);
  private globalService = inject(GlobalService);

  private disabled = false;

  disable() {
    this.disabled = true;
  }

  enable() {
    this.disabled = false;
  }

  openUserReviews(user: User) {
    if (this.disabled) return;
    this.dialog.open(UserReviewsDialogComponent, {
      panelClass: 'dialog-large',
      data: {
        user: user,
      },
    });
  }

  openDownloadModal() {
    if (this.disabled) return;

    this.dialog.open(DownloadModalComponent, {
      panelClass: 'dialog-large',
    });
  }

  async openFeesDialog(
    sellerFees: unknown,
    hasDeclaredValue: boolean,
    cost: number,
  ) {
    if (this.disabled) return;

    this.dialog.open(FeesCalculatorComponent, {
      data: {
        sellerFees: sellerFees,
        declaredValue: hasDeclaredValue,
        productCost: cost,
      },
      panelClass: 'dialog-normal',
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
  }

  async openCheckoutValues(checkoutValues: CheckoutValues) {
    if (this.disabled) return;

    this.dialog.open(CheckoutTotalDetailsComponent, {
      data: checkoutValues,
      panelClass: 'dialog-normal',
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
  }

  async openOpenAppDialog(route: string) {
    if (this.disabled) return;

    await this.dialog.open(OpenAppDialogComponent, {
      data: { appRoute: route },
      panelClass: 'dialog-normal',
    });
  }

  async openQuestionsSecurityDialog(seller: boolean) {
    const dialogRef = this.dialog.open(TkQuestionsSecurityDialogComponent, {
      panelClass: 'dialog-security-questions',
      disableClose: true,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      data: {
        seller: seller,
      },
    });

    await lastValueFrom(dialogRef.afterClosed());
  }

  async openPhoneVerifyDialog(): Promise<boolean> {
    const params = await firstValueFrom(this.globalService.params);
    const dialogRef = this.dialog.open(PhoneVerifyDialogComponent, {
      panelClass: 'dialog-phone-verify',
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      data: {
        phone: this.authService.getUserValue()?.phone ?? '',
        smsAvailable: !!params?.smsOtp,
        whatsappAvailable: !!params?.whatsappOtp,
      },
    });

    const result = await lastValueFrom(dialogRef.afterClosed());
    return result?.verified || false;
  }

  openCouponDialog(coupon: Coupon) {
    if (this.disabled) return;
    this.dialog.open(CouponInfoDialogComponent, {
      panelClass: 'dialog-normal',
      data: { coupon: coupon },
    });
  }

  openExitDialog() {
    if (this.disabled) return;

    this.dialog.open(ExitPopupComponent, {
      panelClass: 'dialog-normal',
    });
  }
}
