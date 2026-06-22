import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BuyingService, CheckoutLocal } from '@trokai/shared-data-access';
import { LoadingService } from '../../loading/loading.service';

@Component({
  selector: 'tk-coupon-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './tk-coupon-form.component.html',
  styleUrl: './tk-coupon-form.component.scss',
})
export class TkCouponFormComponent implements OnInit {
  couponCode!: string;
  checkoutLocal!: CheckoutLocal;
  couponApplied = false;
  showInput = false;

  @ViewChild('couponInput') couponInput!: ElementRef;

  private loading = inject(LoadingService);
  private buyingService = inject(BuyingService);

  ngOnInit() {
    this.buyingService.checkoutLocal$.subscribe(
      (c) => (this.checkoutLocal = c!),
    );
  }

  async onApply() {
    if (!this.couponCode) return;
    try {
      this.loading.start();
      this.checkoutLocal.couponCode = this.couponCode;
      this.buyingService.setCheckoutLocal(this.checkoutLocal);
      await this.buyingService.getCheckoutData();
      this.couponApplied = true;
    } catch {
      this.checkoutLocal.couponCode = undefined as any;
      this.couponApplied = false;
    } finally {
      this.loading.finish();
    }
  }

  onBlur() {
    if (!this.couponCode) this.showInput = false;
  }

  onShowInput() {
    this.showInput = true;
    setTimeout(() => this.couponInput?.nativeElement.focus(), 200);
  }

  async clearSelection() {
    try {
      this.loading.start();
      this.buyingService.setCheckoutLocal({
        ...this.checkoutLocal,
        couponCode: undefined as any,
      });
      await this.buyingService.getCheckoutData();
      this.couponApplied = false;
      this.showInput = false;
      this.couponCode = undefined as any;
    } finally {
      this.loading.finish();
    }
  }
}
