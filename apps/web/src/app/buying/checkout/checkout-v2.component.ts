import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { BuyingService, CheckoutLocal } from '@trokai/shared-data-access';
import { LoadingService } from '@trokai/shared-ui';
import { takeUntil } from 'rxjs';
import { AutoUnsubscribe } from 'src/app/autounsubscribe';

@Component({
  selector: 'app-checkout-v2',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './checkout-v2.component.html',
  styleUrl: './checkout-v2.component.scss',
})
export class CheckoutV2Component extends AutoUnsubscribe implements OnInit {
  private buyingService = inject(BuyingService);
  private loading = inject(LoadingService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  checkoutLocal?: CheckoutLocal;

  ngOnInit() {
    if (isPlatformServer(this.platformId)) return;

    // Subscribe to checkout local changes
    this.buyingService.checkoutLocal$
      .pipe(takeUntil(this.destroySignal))
      .subscribe((checkoutLocal) => {
        if (
          !checkoutLocal?.products?.length &&
          (this.checkoutLocal?.products?.length ?? 0) > 0
        ) {
          // if cart is empty, redirect to carts
          this.router.navigateByUrl('/buying/carts');
          this.checkoutLocal = undefined;
        } else {
          this.checkoutLocal = checkoutLocal ?? undefined;
        }
      });

    this.load();
  }

  async load() {
    const checkoutLocal = this.buyingService.getCheckoutLocalValue();
    const checkoutResponse = this.buyingService.getCheckoutResponseValue();

    try {
      this.loading.start();
      if (!checkoutLocal) await this.loadFromStorage();
      else if (!checkoutResponse) await this.buyingService.getCheckoutData();
      else this.buyingService.setCheckoutLocal(checkoutLocal);
    } finally {
      this.loading.finish();
    }
  }

  async loadFromStorage() {
    try {
      if (!(await this.buyingService.mountCheckout()))
        throw new Error('Error mounting checkout');
    } catch {
      this.router.navigateByUrl('/buying/carts');
    }
  }
}
