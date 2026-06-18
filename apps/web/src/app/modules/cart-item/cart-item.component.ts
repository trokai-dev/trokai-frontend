import { CostPipe, HideLoadingImageDirective } from '@trokai/shared-ui';
import { Clothes } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { environment } from 'src/environments/environment';
import { CurrencyPipe } from '@angular/common';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    HideLoadingImageDirective,
    LazyLoadImageModule,
    CurrencyPipe,
    CostPipe,
  ],
})
export class CartItemComponent {
  @Input() product!: Clothes;
  @Input() showRemove = false;
  @Output() clickRemove = new EventEmitter();
  @Output() clickProduct = new EventEmitter();
  url = environment.imageURL;

  remove(event: Event) {
    event.stopPropagation();
    this.clickRemove.emit();
  }
}
