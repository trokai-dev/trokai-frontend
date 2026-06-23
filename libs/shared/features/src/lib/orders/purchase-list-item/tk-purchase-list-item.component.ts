import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CostPipe, TkCartItemComponent } from '@trokai/shared-ui';
import { OrderDisplay } from '@trokai/shared-core';

/**
 * Purchase list row (canonical web design: tk-cart-item products + date / cost /
 * status / "Ver compra"). `useLink` selects navigation: web routerLink to the
 * detail (relative `_id`); app `useLink=false` → emits `(open)` for its shell.
 */
@Component({
  selector: 'tk-purchase-list-item',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    TkCartItemComponent,
    CostPipe,
  ],
  templateUrl: './tk-purchase-list-item.component.html',
  styleUrl: './tk-purchase-list-item.component.scss',
})
export class TkPurchaseListItemComponent {
  @Input({ required: true }) order!: OrderDisplay;
  /** Web: navigate via the rendered `routerLink`. App: false → emit `(open)`. */
  @Input() useLink = true;

  @Output() open = new EventEmitter<OrderDisplay>();
}
