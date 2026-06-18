import { PostageAgency, ShippingServices } from '@trokai/shared-core';
import { Component, OnInit, inject } from '@angular/core';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrdersService } from '@trokai/shared-data-access';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';

import { AlertService } from '@trokai/shared-ui';

@Component({
  selector: 'app-postage-options',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './postage-options.component.html',
  styleUrl: './postage-options.component.scss',
})
export class PostageOptionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrdersService);
  private alert = inject(AlertService);

  agencies: PostageAgency[] = [];
  visibleAgencies: PostageAgency[] = [];
  selectedAgency: PostageAgency | null = null;
  shippingLogo: string | null = null;

  orderId: string | null = null;
  loading = false;

  private agenciesPage = 0;
  readonly agenciesPageSize = 20;

  async ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('order_id');
    if (!this.orderId) return;

    await this.start(this.orderId);
    // if (this.route.snapshot.paramMap.get('open_chat')) this.chat();
  }

  async start(orderId: string) {
    try {
      this.loading = true;

      const order = await this.orderService.fetchOrder(orderId);

      // verifica se ja tem etiqueta
      if (
        order.postageLabel?.melhorEnvioId &&
        new Date(order.postageLabel?.expirationDate) > new Date()
      ) {
        this.router.navigateByUrl('/orders/sales/' + orderId);
        return;
      }

      switch (order.shippingValues?.service) {
        case ShippingServices.JADLOG_PACKAGE:
        case ShippingServices.JADLOG_COM:
        case ShippingServices.JADLOG_PACKAGE_CENTRALIZADO:
          this.shippingLogo = 'logo_jadlog.png';
          break;
        case ShippingServices.LOGGI_PONTO:
        case ShippingServices.LOGGI_EXPRESS:
          this.shippingLogo = 'logo_loggi.png';
          break;
        case ShippingServices.JET:
          this.shippingLogo = 'logo_jet.png';
          break;
        default:
          this.shippingLogo = null;
      }

      const agencies = await this.orderService.listShippingAgencies(order._id);

      this.agencies = agencies;
      this.agenciesPage = 0;
      this.visibleAgencies = [];
      this.loadMoreAgencies();
    } finally {
      this.loading = false;
    }
  }

  loadMoreAgencies() {
    if (!this.agencies) return;
    const start = this.agenciesPage * this.agenciesPageSize;
    const end = start + this.agenciesPageSize;
    this.visibleAgencies = this.visibleAgencies.concat(
      this.agencies.slice(start, end),
    );
    this.agenciesPage++;
  }

  selectAgency(event: MatRadioChange) {
    const selectedId = event.value;
    this.selectedAgency =
      this.agencies.find((agency) => agency.id === selectedId) || null;
  }

  async confirmSelection() {
    if (!this.orderId || !this.selectedAgency) return;

    let msg = `Confirmar ponto de coleta <b>${this.selectedAgency.name}</b>? Não será possível alterar depois.`;

    if (this.selectedAgency.initials === 'PLU') {
      msg +=
        '<br><br>Ao postar seus envios pela primeira vez em qualquer unidade parceira, avise que as etiquetas foram geradas pelo Melhor Envio. Sempre aguarde a equipe do local fazer a bipagem das etiquetas antes de sair.';
    }

    const res = await this.alert.question(
      msg,
      'Atenção',
      'Confirmar seleção',
      'Cancelar',
    );

    if (!res) return;

    try {
      this.loading = true;

      const res = await this.orderService.confirmShippingAgency(
        this.orderId,
        this.selectedAgency.id,
      );

      window.location.href = res.melhorEnvioUrl;
    } finally {
      this.loading = false;
    }
  }
}
