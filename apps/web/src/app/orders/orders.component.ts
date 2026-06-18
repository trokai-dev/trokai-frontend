import { AfterViewInit, Component, inject } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { MenuOrdersComponent } from './menu-orders/menu-orders.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  standalone: true,
  imports: [MenuOrdersComponent, RouterOutlet, RouterModule],
})
export class OrdersComponent implements AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  hideMenu = false;

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideMenu = !!this.route.firstChild?.snapshot.params['order_id'];
      }
    });
  }

  ngAfterViewInit(): void {
    this.hideMenu = !!this.route.firstChild?.snapshot.params['order_id'];
  }
}
