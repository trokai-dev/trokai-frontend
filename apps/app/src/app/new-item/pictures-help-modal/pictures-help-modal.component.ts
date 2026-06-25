import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import {
  IonContent,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { PictureTip } from '@trokai/shared-core';

@Component({
  selector: 'app-pictures-help-modal',
  templateUrl: './pictures-help-modal.component.html',
  styleUrls: ['./pictures-help-modal.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [MatButtonModule, IonIcon, IonContent],
})
export class PicturesHelpModalComponent {
  private modalCtrl = inject(ModalController);

  @ViewChild('swiper') set swiper(swiperRef: ElementRef) {
    setTimeout(() => {
      if (swiperRef?.nativeElement?.swiper) {
        // swiper is ready
      }
    });
  }

  constructor() {
    addIcons({ closeOutline });
  }

  tips: PictureTip[] = [
    {
      label: 'A luz natural é sua melhor amiga',
      description:
        'Fotografe perto de janelas. A luz natural deixa as cores mais fiéis e o produto mais atraente.',
      img: 'assets/product-tips/1c.png',
    },
    {
      label: 'Foco no produto',
      description:
        'Evite filtros, marcas d\u2019água e quaisquer informações que atrapalhem a visualização do produto.',
      img: 'assets/product-tips/2c.png',
    },
    {
      label: 'Atenção ao enquadramento',
      description:
        'Centralize ou crie respiros nas fotos. Evite cortar partes importantes do produto.',
      img: 'assets/product-tips/3c.png',
    },
    {
      label: 'Fotos reais do produto',
      description: 'Não coloque fotos de I.A nem de catálogo da internet.',
      img: 'assets/product-tips/4c.png',
    },
    {
      label: 'Detalhes fazem a diferença',
      description:
        'Mostre de perto os detalhes, como texturas, etiquetas e possíveis defeitos.',
      img: 'assets/product-tips/5c.png',
    },
  ];

  close() {
    this.modalCtrl.dismiss();
  }
}
