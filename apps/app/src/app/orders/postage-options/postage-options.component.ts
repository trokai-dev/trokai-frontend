import { PostageAgency, ShippingServices } from '@trokai/shared-core';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrdersService } from '@trokai/shared-data-access';
import { FormsModule } from '@angular/forms';

import { AlertService } from '@trokai/shared-ui';

import {
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonRadioGroup,
  IonRadio,
  IonItem,
  IonLabel,
  IonFooter,
  RadioGroupCustomEvent,
} from '@ionic/angular/standalone';
import { BackButtonComponent } from 'src/app/shared/components/back-button/back-button.component';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-postage-options',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    IonRadioGroup,
    IonRadio,
    IonItem,
    IonLabel,
    IonFooter,
    FormsModule,
    RouterModule,
    BackButtonComponent,
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
    Browser.addListener('browserFinished', () => this.start(this.orderId));
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
        this.router.navigateByUrl('main/negotiations/sale/' + orderId);
        return;
      }

      switch (order.shippingValues.service) {
        case ShippingServices.JADLOG_PACKAGE:
        case ShippingServices.JADLOG_COM:
          this.shippingLogo = 'logo_jadlog.png';
          break;
        case ShippingServices.LOGGI_PONTO:
          this.shippingLogo = 'logo_loggi.png';
          break;
        default:
          this.shippingLogo = null;
      }

      const agencies = await this.orderService.listShippingAgencies(order._id);

      this.agencies = agencies;
      this.agenciesPage = 0;
      this.visibleAgencies = [];
      this.loadMoreAgencies();
      console.log(agencies);
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

  selectAgency(event: RadioGroupCustomEvent) {
    const selectedId = event.detail.value;
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

    const res = await this.alert.askQuestion(
      'Atenção',
      msg,
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

      Browser.open({ url: res.melhorEnvioUrl });
    } finally {
      this.loading = false;
    }
  }
}
