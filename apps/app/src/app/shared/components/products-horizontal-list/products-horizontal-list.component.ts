import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { environment } from 'src/environments/environment';

import { TkProductCardComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-products-horizontal-list',
  templateUrl: './products-horizontal-list.component.html',
  styleUrls: ['./products-horizontal-list.component.scss'],
  standalone: true,
  imports: [TkProductCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsHorizontalListComponent {
  @ViewChild('tagMore') tagMoreItems: ElementRef; // alterado para UPDATE

  @Input() seeMore = false;
  @Input() products = null;
  @Input() title = false;

  @Input() loadingMore = false;
  @Input() gotAll = false;

  @Input() canGetMore = true;
  @Input() showTitle = true;

  @Output() selected = new EventEmitter();
  @Output() navMore = new EventEmitter();
  @Output() getMore = new EventEmitter();

  emptyList = [{}, {}, {}, {}, {}];

  url = environment.imageURL;

  clicked(p) {
    if (p.empty) return;
    this.selected.emit(p);
  }

  clickSeeMore() {
    this.navMore.emit();
  }

  getMoreItens() {
    this.getMore.emit();
  }

  formatDistance(d) {
    if (d == null) return '';

    if (d >= 1000) return (d / 1000).toFixed(0) + ' Km';
    else return (d.toFixed(0) > 0 ? d.toFixed(0) : '10') + ' m';
  }
}
