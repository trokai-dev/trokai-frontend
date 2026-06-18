import {
  AfterViewInit,
  Component,
  NgZone,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { PictureTip } from '@trokai/shared-core';

@Component({
  selector: 'app-pictures-help-dialog',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './pictures-help-dialog.component.html',
  styleUrl: './pictures-help-dialog.component.scss',
})
export class PicturesHelpDialogComponent implements AfterViewInit {
  dialogRef = inject<MatDialogRef<PicturesHelpDialogComponent>>(MatDialogRef);
  private ngZone = inject(NgZone);

  swiperRef!: Swiper;

  tips: PictureTip[] = [
    {
      label: 'A luz natural é sua melhor amiga',
      description:
        'Fotografe perto de janelas. A luz natural deixa as cores mais fiéis e o produto mais atraente.',
      img: '../../assets/product-tips/1c.png',
    },
    {
      label: 'Foco no produto',
      description:
        "Evite filtros, marcas d'água e quaisquer informações que atrapalhem a visualização do produto.",
      img: '../../assets/product-tips/2c.png',
    },
    {
      label: 'Atenção ao enquadramento',
      description:
        'Centralize ou crie respiros nas fotos. Evite cortar partes importantes do produto.',
      img: '../../assets/product-tips/3c.png',
    },
    {
      label: 'Fotos reais do produto',
      description: 'Não coloque fotos de I.A nem de catálogo da internet.',
      img: '../../assets/product-tips/4c.png',
    },
    {
      label: 'Detalhes fazem a diferença',
      description:
        'Mostre de perto os detalhes, como texturas, etiquetas e possíveis defeitos.',
      img: '../../assets/product-tips/5c.png',
    },
  ];

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.swiperRef = new Swiper('.pictures-help-swiper', {
          modules: [Navigation, Pagination],
          slidesPerView: 1,
          spaceBetween: 16,
          loop: false,
          navigation: {
            nextEl: '.custom-next.tips',
            prevEl: '.custom-prev.tips',
          },
          pagination: {
            el: '.pictures-help-pagination',
            clickable: true,
          },
        });
      }, 0);
    });
  }

  close() {
    this.dialogRef.close();
  }
}
