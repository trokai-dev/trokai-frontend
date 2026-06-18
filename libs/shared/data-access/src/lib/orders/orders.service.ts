import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  APP_CONFIG,
  NavigationManager,
  Order,
  OrderListItem,
  OrderStatus,
  OrderStatusString,
  PostageAgency,
} from '@trokai/shared-core';
import { lastValueFrom, map } from 'rxjs';
import { ReviewModel } from './orders.models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private urlApi = inject(APP_CONFIG).urlApi;
  private nav = inject(NavigationManager);

  fetchPurchases() {
    const buyerId = this.nav.currentUserId();
    return lastValueFrom(
      this.http
        .get<OrderListItem[]>(`${this.urlApi}/payments/orders/me`)
        .pipe(map((orders) => orders.filter((o) => o.buyer === buyerId))),
    );
  }

  fetchSales() {
    const sellerId = this.nav.currentUserId();
    return lastValueFrom(
      this.http
        .get<OrderListItem[]>(`${this.urlApi}/payments/orders/me`)
        .pipe(map((orders) => orders.filter((o) => o.seller === sellerId))),
    );
  }

  fetchOrder(orderId: string) {
    return lastValueFrom(
      this.http.get<Order>(`${this.urlApi}/payments/orders/${orderId}`),
    );
  }

  getOrderStatus(status: OrderStatus): string {
    return OrderStatusString[status];
  }

  confirmLocalWithdrawal(orderId: string) {
    return lastValueFrom(
      this.http.post(`${this.urlApi}/payments/orders/conclude`, { orderId }),
    );
  }

  reviewOrder(rate: ReviewModel) {
    rate.type = 'order';
    return lastValueFrom(
      this.http.post(`${this.urlApi}/users/review`, rate),
    );
  }

  cancelPurchase(orderId: string) {
    return lastValueFrom(
      this.http.delete(`${this.urlApi}/payments/orders/${orderId}`),
    );
  }

  cancelSale(orderId: string, message: string) {
    return lastValueFrom(
      this.http.delete(`${this.urlApi}/payments/orders/${orderId}/seller`, {
        body: { message },
      }),
    );
  }

  returnPurchase(orderId: string) {
    return lastValueFrom(
      this.http.delete(`${this.urlApi}/payments/orders/${orderId}/return`),
    );
  }

  listShippingAgencies(orderId: string) {
    return lastValueFrom(
      this.http
        .get<PostageAgency[]>(`${this.urlApi}/shipment/order/${orderId}/agencies`)
        .pipe(map((agencies) => agencies.map((a) => new PostageAgency(a)))),
    );
  }

  confirmShippingAgency(
    orderId: string,
    agencyId: number | null,
  ): Promise<{ melhorEnvioUrl: string }> {
    return lastValueFrom(
      this.http.post<{ melhorEnvioUrl: string }>(
        `${this.urlApi}/payments/orders/postage-label`,
        { orderId, agencyId },
      ),
    );
  }
}
