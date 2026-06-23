import { Clothes } from '@trokai/shared-core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CostPipe } from '../../pipes/cost.pipe';
import { HideLoadingImageDirective } from '../../directives/hide-loading-image.directive';

@Component({
  selector: 'tk-cart-item',
  templateUrl: './tk-cart-item.component.html',
  styleUrls: ['./tk-cart-item.component.scss'],
  standalone: true,
  imports: [
    CurrencyPipe,
    CostPipe,
    HideLoadingImageDirective,
    MatButtonModule,
    MatIconModule,
  ],
})
export class TkCartItemComponent {
  @Input() product!: Clothes;
  @Input() showRemove = false;
  @Output() clickRemove = new EventEmitter<void>();
  @Output() clickProduct = new EventEmitter<void>();

  remove(event: Event) {
    event.stopPropagation();
    this.clickRemove.emit();
  }
}
