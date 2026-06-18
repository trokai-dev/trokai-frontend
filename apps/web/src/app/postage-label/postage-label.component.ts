import { CostPipe } from '@trokai/shared-ui';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
const bwipjs = require('bwip-js');
import {
  isPlatformBrowser,
  CurrencyPipe,
  DatePipe,
  NgStyle,
} from '@angular/common';
import { BrowserRef } from '../services/browser-ref.service';
import { Etiqueta } from '../models/postage';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-postage-label',
  templateUrl: './postage-label.component.html',
  styleUrls: ['./postage-label.component.scss'],
  standalone: true,
  imports: [
    CurrencyPipe,
    CostPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    NgStyle,
    MatProgressSpinnerModule,
  ],
})
export class PostageLabelComponent implements OnInit {
  private title = inject(Title);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private browserRef = inject(BrowserRef);

  order: any;
  etiqueta!: Etiqueta;

  pesoTotalG = '';
  pesoTotalS = '';
  valorTotal = 0;

  imgMatrix = '';
  imgBarrasCep = '';
  imgBarrasPlp = '';
  imgBarrasEncomenda = '';

  done = false;
  printing = false;

  async ngOnInit() {
    this.title.setTitle('Etiqueta Correios | Trokaí');
    try {
      if (!isPlatformBrowser(this.platformId)) return;

      const id = this.route.snapshot.params['order_id'];

      if (!id) {
        this.router.navigateByUrl('/');
        return;
      }

      this.etiqueta = await (
        await lastValueFrom(
          this.http.post<{ etiqueta: Etiqueta }>(
            environment.urlApi + '/payments/orders/postage-label/v2/',
            { orderId: id },
          ),
        )
      ).etiqueta;

      this.calculos();
      await this.imagens();

      this.done = true;
    } catch {
      /* intentional */
    }
  }

  getMainAddrLine(address: any) {
    if (address.complement)
      return `${address.street} ${address.number}, ${address.complement}`;
    return `${address.street} ${address.number}`;
  }

  calculos() {
    const pesoTotal = this.etiqueta.order.products
      .map((item) => item.weight)
      .reduce((total, item) => total + item);

    this.pesoTotalG = (pesoTotal * 1000)
      .toFixed(0)
      .toString()
      .replace('.', ',');

    this.pesoTotalS = pesoTotal.toFixed(1).toString().replace('.', ',') + ' kg';

    this.valorTotal = this.etiqueta.order.products
      .map((item) => item.cost)
      .reduce((total, item) => total + item);
  }

  async imagens() {
    const canvas = document.createElement('canvas');

    // encomenda
    await bwipjs.toCanvas(canvas, {
      bcid: 'code128',
      text: this.etiqueta.order.codigoRastreio,
      scale: 3,
      height: 18,
      width: 80,
      textfont: 'Arial',
      textsize: 11,
      textyalign: 'above',
      includetext: true,
      textxalign: 'center',
    });

    this.imgBarrasEncomenda = canvas.toDataURL('base64');

    // matrix
    await bwipjs.toCanvas(canvas, {
      bcid: 'datamatrix',
      text: this.etiqueta.order.valorMatrix,
      scale: 3,
      height: 25,
      width: 25,
      includetext: false,
    });

    this.imgMatrix = canvas.toDataURL('base64');

    // barras CEP
    await bwipjs.toCanvas(canvas, {
      bcid: 'code128',
      text: this.etiqueta.buyer.address.zipCode,
      scale: 3,
      height: 18,
      width: 40,
      includetext: false,
    });

    this.imgBarrasCep = canvas.toDataURL('base64');

    if (
      this.etiqueta.order.plp &&
      this.etiqueta.order.plp.toString().length > 0
    ) {
      await bwipjs.toCanvas(canvas, {
        bcid: 'code128',
        text: this.etiqueta.order.plp.toString(),
        scale: 6,
        height: 6,
        width: 18,
        textfont: 'Arial',
        textsize: 5,
        textyalign: 'above',
        includetext: true,
        textxalign: 'center',
      });

      this.imgBarrasPlp = canvas.toDataURL('base64');
    }
  }

  async onSave() {
    /* intentional */
  }

  async onPrint() {
    this.printing = true;

    setTimeout(() => {
      this.browserRef.window?.print(); // imprime so no navegador
      this.printing = false;
    }, 1000); // espera a imagem carregar
  }
}
