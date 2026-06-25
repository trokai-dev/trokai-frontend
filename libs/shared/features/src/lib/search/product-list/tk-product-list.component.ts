import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Clothes, Filters } from '@trokai/shared-core';
import { TkProductCardComponent } from '@trokai/shared-ui';
import { TkFilterFormComponent } from '../filter-form/tk-filter-form.component';

/**
 * Shared product-results layout: optional filter sidebar (`showFilters`) +
 * product grid via the existing `TkProductCardComponent`. The filter UI lives
 * here, inside the product path only — `TkUserListComponent` has no `filter`
 * input at all, so there is no shared shell a filter could leak into.
 */
@Component({
  selector: 'tk-product-list',
  standalone: true,
  imports: [TkFilterFormComponent, TkProductCardComponent],
  templateUrl: './tk-product-list.component.html',
  styleUrl: './tk-product-list.component.scss',
})
export class TkProductListComponent {
  @Input() products: Clothes[] = [];
  @Input() useLink = true;
  @Input() filter = new Filters();
  @Input() showFilters = true;
  @Input() enableSorting = true;

  @Output() open = new EventEmitter<Clothes>();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onFinishLiking = new EventEmitter<void>();
  @Output() filtersChange = new EventEmitter<Filters>();
}
