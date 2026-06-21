import { Order } from '@trokai/shared-core';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { MatButtonModule } from '@angular/material/button';
import { NgxMaskPipe } from 'ngx-mask';
import { LoadingService } from '@trokai/shared-ui';
import { OrdersService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-order-delivery',
  templateUrl: './order-delivery.component.html',
  styleUrls: ['./order-delivery.component.scss'],
  standalone: true,
  imports: [MatButtonModule, DatePipe, NgxMaskPipe],
})
export class OrderDeliveryComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private loading = inject(LoadingService);
  private router = inject(Router);

  @Input() order: Order;
  @Input() isSale = false;
  @Input() isPurchase = false;
  @Output() confirmWithdrawalClick = new EventEmitter();

  protected showEstimatedDelivery = false;
  protected showEtiquetaInfo = false;
  protected showPontoColetaInfo = false;
  protected showTracking = false;

  ngOnInit(): void {
    const order = this.order;

    if (!order) throw new Error('Order is required');

    if (!this.isSale && !this.isPurchase)
      throw new Error('isSale or isPurchase is required');

    if (this.isSale && this.isPurchase)
      throw new Error('isSale and isPurchase cannot be true at the same time');

    this.showTracking = order.orderSent && !order.isDeliveryDone;

    this.showEtiquetaInfo =
      this.isSale && !order.orderSent && !!order.postageLabel;

    this.showPontoColetaInfo =
      this.isSale &&
      !order.isLegacyShipping &&
      !order.orderSent &&
      order.isTransportadora &&
      order.postageLabelCreated &&
      !!order.postageLabel?.melhorEnvioAgency;
  }

  private async openMelhorEnvioCorreios() {
    const res = await this.ordersService.confirmShippingAgency(
      this.order._id,
      null,
    );

    if (res.melhorEnvioUrl && res.melhorEnvioUrl != '')
      Browser.open({ url: res.melhorEnvioUrl });
  }

  protected async onClickEtiqueta() {
    try {
      // abre etiqueta legacy
      if (this.order.isLegacyShipping) {
        Browser.open({
          url: `https://www.trokai.com.br/postage-label/${this.order._id}`,
        });
        return;
      }

      // abre rastreio melhor envio
      if (this.order.postageLabelCreated) {
        window.open(this.order.postageLabel.melhorEnvioUrl, '_system'); // abre no navegador externo (nao imprime pelo capacitor browser)
        return;
      }

      // se transportadora e nao etiqueta, abre opcoes de agencia
      if (this.order.isTransportadora) {
        this.router.navigateByUrl(
          `/main/negotiations/sale/${this.order._id}/postage-options`,
        );
        return;
      }

      // por fim, abre melhor envio correios
      await this.openMelhorEnvioCorreios();
    } finally { /* intentional */ }
  }

  protected async onClickRastrear() {
    if (this.order.postageLabel.melhorEnvioSelfTracking) {
      Browser.open({ url: this.order.melhorEnvioTrackingUrl });
      return;
    }
  }

  protected async onConfirmWithdrawal() {
    this.confirmWithdrawalClick.emit();
  }
}
