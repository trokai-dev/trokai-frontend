import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PaymentBrands } from '@trokai/shared-core';

@Component({
  selector: 'tk-payment-icon',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './tk-payment-icon.component.html',
  styleUrl: './tk-payment-icon.component.scss',
})
export class TkPaymentIconComponent implements OnInit, OnChanges {
  @Input() paymentBrand!: string;
  @Input() showDefaultCardIcon = false;

  imgName: string | null = null;

  load() {
    switch (this.paymentBrand) {
      case PaymentBrands.PIX: this.imgName = 'pix.svg'; break;
      case PaymentBrands.MASTERCARD: this.imgName = 'mastercard.svg'; break;
      case PaymentBrands.VISA: this.imgName = 'visa.svg'; break;
      case PaymentBrands.ELO: this.imgName = 'elo.svg'; break;
      default: this.imgName = null;
    }
  }

  ngOnInit() { this.load(); }
  ngOnChanges() { this.load(); }
}
