import { Order } from '@trokai/shared-core';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { OrdersService } from '@trokai/shared-data-access';
import { BrowserRef } from 'src/app/services/browser-ref.service';
import { LoadingService } from '@trokai/shared-ui';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NgxMaskPipe } from 'ngx-mask';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-order-delivery',
  standalone: true,
  imports: [MatButtonModule, NgxMaskPipe, DatePipe],
  templateUrl: './order-delivery.component.html',
  styleUrl: './order-delivery.component.scss',
})
export class OrderDeliveryComponent implements OnInit {
  private browserRef = inject(BrowserRef);
  private ordersService = inject(OrdersService);
  private loading = inject(LoadingService);
  private router = inject(Router);

  @Input() order!: Order;
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
      this.browserRef.window?.open(res.melhorEnvioUrl, '_blank');
  }

  protected async onClickEtiqueta() {
    try {
      this.loading.start();

      // abre etiqueta legacy
      if (this.order.isLegacyShipping) {
        this.browserRef.window?.open(
          `/postage-label/${this.order._id}`,
          '_blank',
        );
        return;
      }

      // abre rastreio melhor envio
      if (this.order.postageLabelCreated) {
        this.browserRef.window?.open(
          this.order.postageLabel?.melhorEnvioUrl,
          '_blank',
        );
        return;
      }

      // se transportadora e nao etiqueta, abre opcoes de agencia
      if (this.order.isTransportadora) {
        this.router.navigateByUrl(
          `/orders/sales/${this.order._id}/postage-options`,
        );
        return;
      }

      // por fim, abre melhor envio correios
      await this.openMelhorEnvioCorreios();
    } finally {
      this.loading.finish();
    }
  }

  protected async onClickRastrear() {
    if (this.order.postageLabel?.melhorEnvioSelfTracking) {
      this.browserRef.window?.open(this.order.melhorEnvioTrackingUrl, '_blank');
      return;
    }
  }

  protected async onConfirmWithdrawal() {
    this.confirmWithdrawalClick.emit();
  }
}
