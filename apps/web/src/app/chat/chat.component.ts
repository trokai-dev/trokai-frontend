import { OrderStatus } from '@trokai/shared-core';
import { User } from '@trokai/shared-core';
import { Component, OnInit, inject } from '@angular/core';
import { take } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AlertService } from '@trokai/shared-ui';
import {
  TkUserAvatarComponent,
  TkChatThreadComponent,
} from '@trokai/shared-ui';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { NegotiationType, OrdersService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatButtonModule, TkUserAvatarComponent, TkChatThreadComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ordersService = inject(OrdersService);
  private alertService = inject(AlertService);

  user!: User;

  otherUser: User | null = null;
  negotiationType: NegotiationType | null = null;
  negotiationId: string | null = null;
  enabled = true;

  typeString = '';

  forbiddenStatus = [
    OrderStatus.WAITING_PAYMENT,
    OrderStatus.CANCELED,
    OrderStatus.PAYMENT_FAILED,
    OrderStatus.CONCLUDED,
    OrderStatus.PAYMENT_REFUNDED,
    OrderStatus.WAITING_REVIEW,
  ];

  async ngOnInit() {
    this.authService.user.pipe(take(1)).subscribe((u) => {
      if (u) this.user = u;
    });
    const routeSegments = this.route.snapshot.url.map((s) => s.path);

    switch (routeSegments[0]) {
      case 'sales':
        this.negotiationType = 'sale';
        this.typeString = 'venda';
        break;
      case 'purchases':
        this.negotiationType = 'purchase';
        this.typeString = 'compra';
        break;
      default:
        this.alertService.alert('Negociação não encontrada');
        this.router.navigate(['/']);
        return;
    }

    this.negotiationId = routeSegments[1];

    if (!this.negotiationId) {
      this.alertService.alert('Negociação não encontrada');
      this.router.navigate(['/']);
      return;
    }

    const order = await this.ordersService.fetchOrder(this.negotiationId);

    if (!order) {
      this.alertService.alert('Negociação não encontrada');
      this.router.navigate(['/']);
      return;
    }

    if (this.forbiddenStatus.includes(order.status)) {
      this.alertService.alert('Chat indisponível para esta negociação');
      this.router.navigate(['/']);
      return;
    }

    this.otherUser =
      order.buyer._id === this.user._id ? order.seller : order.buyer;
  }

  openOrder() {
    this.router.navigate([
      `orders/${this.negotiationType}s/${this.negotiationId}`,
    ]);
  }
}
