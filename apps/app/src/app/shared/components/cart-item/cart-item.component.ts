import { CostPipe } from '@trokai/shared-ui';
import { Clothes } from '@trokai/shared-core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss'],
  standalone: true,
  imports: [IonIcon, CurrencyPipe, CostPipe],
})
export class CartItemComponent {
  @Input() product: Clothes;
  @Input() showRemove = false;
  @Output() clickRemove = new EventEmitter();
  @Output() clickProduct = new EventEmitter();

  constructor() {
    addIcons({ closeOutline });
  }

  remove(event) {
    event.stopPropagation();
    this.clickRemove.emit();
  }
}
