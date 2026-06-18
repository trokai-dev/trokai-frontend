import { Clothes } from '@trokai/shared-core';
import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TkProductCardComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-products-horizontal-list',
  templateUrl: './products-horizontal-list.component.html',
  styleUrls: ['./products-horizontal-list.component.scss'],
  standalone: true,
  imports: [TkProductCardComponent],
})
export class ProductsHorizontalListComponent {
  private router = inject(Router);

  @Input() products: Clothes[] = [];
  @Input() title: string | null = null;

  @Input() seeMore = false;
  @Input() navMore = '';
  @Input() navText = 'Ver mais';
  @Input() borderBottom = true;

  @Input() colsMob = 2;
  @Input() colsDesk = 5;

  nav() {
    this.router.navigateByUrl(this.navMore);
  }
}
