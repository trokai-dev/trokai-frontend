import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AddressOption,
  APP_CONFIG,
  Card,
  Clothes,
  FeedbackService,
  joinWithCommasAnd,
  NavigationManager,
  StorageService,
  User,
} from '@trokai/shared-core';
import { BehaviorSubject, lastValueFrom, tap } from 'rxjs';
import { ProductService } from '../product/product.service';
import { UserService } from '../user/user.service';
import {
  Basket,
  BuyingPayload,
  CheckoutLocal,
  CheckoutResponse,
  PaymentOption,
  ShippingInfo,
} from './buying.models';
import { CheckoutAnalytics, CheckoutNavigator } from './buying.platform';

@Injectable({
  providedIn: 'root',
})
export class BuyingService {
  private http = inject(HttpClient);
  private urlApi = inject(APP_CONFIG).urlApi;
  private nav = inject(NavigationManager);
  private storage = inject(StorageService);
  private feedback = inject(FeedbackService);
  private userService = inject(UserService);
  private productService = inject(ProductService);
  private analytics = inject(CheckoutAnalytics);
  private navigator = inject(CheckoutNavigator);

  private _checkoutLocal = new BehaviorSubject<CheckoutLocal | null>(null);
  private _checkoutResponse = new BehaviorSubject<CheckoutResponse | null>(
    null,
  );

  private _reserves = new BehaviorSubject<any[] | null>(null);
  private _baskets = new BehaviorSubject<Basket[]>([]);

  get checkoutLocal$() {
    return this._checkoutLocal.asObservable();
  }

  get checkoutResponse$() {
    return this._checkoutResponse.asObservable();
  }

  get reserves$() {
    return this._reserves.asObservable();
  }

  get baskets$() {
    return this._baskets.asObservable();
  }

  getCheckoutLocalValue() {
    return this._checkoutLocal.getValue();
  }

  getCheckoutResponseValue() {
    return this._checkoutResponse.getValue();
  }

  getReservesValue() {
    return this._reserves.getValue();
  }

  addProduct(owner: User, product: Clothes) {
    const baskets = this._baskets.getValue();
    const basket = baskets.find((b) => b.owner._id === owner._id);

    if (basket) {
      if (basket.reserved) {
        this.feedback.info(
          'Ops!',
          'Você já tem uma reserva deste armário. Para adicionar produtos é preciso cancelar a reserva atual.',
        );
        return;
      }

      basket.lastAction = new Date();
      basket.products.push(product);
    } else {
      baskets.push(new Basket(owner, [product]));
    }

    this.feedback.success('Produto adicionado à sacola!');
    this.storeBaskets(baskets);
    this._baskets.next(baskets);

    this.markProductAddedToCart(product);
  }

  removeProduct(product: Clothes) {
    let baskets = this._baskets.getValue();
    const basket = baskets.find((b) => b.owner._id === product.owner);

    if (!basket) return;

    basket.products.splice(
      basket.products.findIndex((p) => p._id === product._id),
      1,
    );
    this.feedback.success('Produto removido');

    if (!basket.products.length)
      baskets = baskets.filter((b) => b.owner._id !== basket.owner._id);

    this.storeBaskets(baskets);
    this._baskets.next(baskets);
  }

  storeBaskets(baskets: Basket[]) {
    this.storage.set('baskets', JSON.stringify(baskets));
  }

  async loadBasketsStorage() {
    const stored = await this.storage.get('baskets');
    if (!stored) return;

    const parsed = JSON.parse(stored);

    const baskets: Basket[] = [];
    parsed.forEach((b: any) =>
      baskets.push(new Basket(b.owner, b.products, b.lastAction)),
    );

    this._baskets.next(baskets);
  }

  calculateShippingFee(zipCode: string, clothes: Clothes[]) {
    let string = '';

    for (const c of clothes) string += '&clothes=' + c._id;

    return lastValueFrom(
      this.http.get<ShippingInfo>(
        `${this.urlApi}/payments/shipping-fee?zipCode=${zipCode + string}`,
      ),
    );
  }

  getBasketFromOwner(ownerId: string) {
    const baskets = this._baskets.getValue();
    return baskets?.find((b) => b.owner._id === ownerId);
  }

  // user is interested in buying this product
  public async markProductAddedToCart(product: Clothes) {
    this.analytics.addToCart(product);
    if (!this.nav.isAuthenticated()) return;
    await lastValueFrom(
      this.http.post(`${this.urlApi}/clothes/cart-info`, {
        clothesId: product._id,
      }),
    );
  }

  async reserve(basket: Basket) {
    // already reserved products
    let reserved_clothes = this._reserves.getValue();
    if (!reserved_clothes) reserved_clothes = basket.products;
    else reserved_clothes = reserved_clothes.concat(basket.products);
    try {
      await lastValueFrom(
        this.http.post<Clothes[]>(`${this.urlApi}/clothes/reserve`, {
          clothes: basket.products,
        }),
      );

      await this.getMyReserves();
      const cartTotal = basket.products.reduce((a, p) => a + p.cost, 0);
      this.analytics.beginCheckout(cartTotal, basket.products);
    } catch (error) {
      if ((error as any).error) this.reserveError((error as any).error, basket);
      // eslint-disable-next-line no-empty
    } finally {
    }
  }

  async cancelReserve(ownerId: string) {
    const allow = await this.feedback.confirm(
      'Cancelar reserva?',
      'Os produtos ficarão disponíveis para compra novamente',
      'Sim, quero cancelar',
      'Não',
      true,
    );

    if (!allow) return false;

    try {
      await lastValueFrom(
        this.http.delete(`${this.urlApi}/clothes/reserved/me/${ownerId}`),
      );
      this.reserveCanceled();
      return true;
    } catch {
      return false;
    }
  }

  async reserveCanceled() {
    await this.clearCheckout();
    this.feedback.success('Reserva cancelada');
  }

  async reserveExpired() {
    await this.clearCheckout();
    this.feedback.error('Reserva expirada');
  }

  async reservePurchased(
    ownerId: string,
    orderId: string,
    value: number,
    items: Clothes[],
  ) {
    this.removeBasketFromOwner(ownerId);
    await this.clearCheckout();
    this.analytics.purchase(orderId, value, items);
  }

  private async clearCheckout() {
    // se existe, limpa carrinho
    await this.storage.remove('last_checkout');
    this._checkoutLocal.next(null);
    this._checkoutResponse.next(null);
    await this.getMyReserves();
  }

  removeBasketFromOwner(ownerId: string) {
    let baskets = this._baskets.getValue();
    baskets = baskets.filter((b) => b.owner._id !== ownerId);
    this.storeBaskets(baskets);
    this._baskets.next(baskets);
  }

  setCheckoutLocal(checkout: CheckoutLocal, store = true) {
    this._checkoutLocal.next({ ...checkout });
    if (store) this.storeCheckoutLocal(checkout);
  }

  async getMyReserves() {
    /* tive que usar o timestamp para forçar o refresh do cache
    ate da pra fazer uma logica de esperar o app estabilizar, mas quando a pessoa faz login e redireciona pro carrinho,
    pode demorar até o app estabilizar, então melhor forçar o refresh*/
    const reserves = await lastValueFrom(
      this.http.get<any[]>(
        `${this.urlApi}/clothes/reserved/me?t=${new Date().getTime()}`,
      ),
    );

    this._reserves.next(reserves);
    this.checkReserves(reserves);
  }

  async checkReserves(reserves: Clothes[]) {
    try {
      const owners = new Set(reserves.map((el) => el.owner));
      const baskets = this._baskets.getValue();
      const missingOwnerBaskets: string[] = []; // after logout the baskets are gone

      // refresh previously reserved baskets
      const formerReserves = baskets.filter(
        (b) => b.reserved && !owners.has(b.owner._id),
      );

      owners.forEach((ownerId) => {
        if (!baskets.find((b) => b.owner._id === ownerId))
          missingOwnerBaskets.push(ownerId!); // missing baskets
      });

      const promises: Promise<any>[] = [];

      missingOwnerBaskets.forEach((ownerId) => {
        promises.push(this.userService.getUserById(ownerId)); // user info to create basket
      });

      const missingOwnersInfo = await Promise.all(promises);

      // create missing baskets
      missingOwnersInfo.forEach((owner) => {
        const newBasket = new Basket(
          owner,
          reserves.filter((r) => r.owner === owner._id),
        );
        baskets.push(newBasket);
      });

      // mark baskets as reserved
      baskets.forEach((basket) => {
        if (owners.has(basket.owner._id)) basket.reserved = true;
      });

      this.storeBaskets(baskets);
      this._baskets.next(baskets);

      this.refreshFormerReserves(formerReserves);
      // eslint-disable-next-line no-empty
    } catch {}
  }

  async refreshFormerReserves(formerReserves: Basket[]) {
    try {
      const promises: Promise<any>[] = [];

      for (const basket of formerReserves) {
        basket.products.forEach((product) =>
          promises.push(this.productService.fetchCompleteProduct(product._id!)),
        );

        let products = await Promise.all(promises);
        products = products.map((p) => p.clothes);

        basket.products = products;
        basket.reserved = false;
      }

      let baskets = this._baskets.getValue();
      baskets = baskets.filter(
        (b) => !formerReserves.find((r) => r.owner._id === b.owner._id),
      );
      baskets = baskets.concat(formerReserves);

      this.storeBaskets(baskets);
      this._baskets.next(baskets);
      // eslint-disable-next-line no-empty
    } catch {}
  }

  private isReserved(basket: Basket): boolean {
    return (
      this._baskets.getValue().find((b) => b.owner._id === basket.owner._id)
        ?.reserved ?? false
    );
  }

  async openCheckout(ownerId: string) {
    try {
      this.feedback.startLoading();

      const baskets = this._baskets.getValue();
      const basket = baskets.find((b) => b.owner._id === ownerId);

      if (!basket) {
        this.feedback.error('Nenhum produto encontrado');
        return;
      }

      if (!basket.reserved) await this.reserve(basket);
      await this.mountCheckout(basket);
    } finally {
      this.feedback.stopLoading();
    }
  }

  // START CHECKOUT AQUI!
  public async mountCheckout(basket?: Basket): Promise<boolean> {
    try {
      if (basket && !this.isReserved(basket)) return false; // verifica reservas

      const storedCheckout = await this.storage.get('last_checkout');

      let checkoutLocal = new CheckoutLocal();

      if (!basket && !storedCheckout) return false;

      if (storedCheckout) {
        const parsed = JSON.parse(storedCheckout);
        // only restores if dont have basket/owner or if exisitng owner is same as stored
        if (
          !basket?.owner ||
          (basket.owner && parsed.owner?._id === basket.owner._id)
        )
          checkoutLocal = parsed;
      }

      if (!checkoutLocal.owner) checkoutLocal.owner = basket!.owner;

      await this.loadBasketsStorage();
      await this.getMyReserves();

      const clothes = (this._reserves.getValue() ?? []).filter(
        (c) => c.owner === checkoutLocal.owner._id,
      );

      if (!clothes || !clothes.length) {
        this.clearCheckout();
        return false;
      }

      if (checkoutLocal.cardId) {
        // if card is not in user cards, remove it
        const user = this.nav.currentUser();
        if (!user) return false;
        if (!user.cards.find((c: Card) => c._id === checkoutLocal.cardId)) {
          checkoutLocal.cardId = undefined;
          checkoutLocal.paymentOption = undefined as any;
          this.setCheckoutLocal(checkoutLocal);
        } else {
          checkoutLocal.paymentOption = PaymentOption.CREDIT_CARD;
        }
      }

      checkoutLocal.products = clothes;
      this._checkoutLocal.next(checkoutLocal);
      await this.getCheckoutData();

      this.navigateCheckout();

      return true;
    } catch {
      return false;
    }
  }

  public async goToAddAddress() {
    this.navigator.toShippingAddress();
  }

  public async goToNewCard() {
    this.navigator.toNewCard();
  }

  public async goToPaymentOptions() {
    this.navigator.toPaymentOptions();
  }

  public async goToReview() {
    this.navigator.toReview();
  }

  public async goToShipping() {
    const checkoutLocal = this._checkoutLocal.getValue();
    const user = this.nav.currentUser();
    const owner = checkoutLocal?.owner;

    // if only in person, can skip address validation
    if (owner?.seller?.inPerson && !owner?.seller?.shipping)
      this.navigator.toShipping();
    else if (!user?.address) this.navigator.toShippingAddress();
    else this.navigator.toShipping();
  }

  public async afterAddressUpdate() {
    await this.getCheckoutData();
    this.navigateCheckout();
  }

  public async navigateCheckout(resetInstallments = false) {
    const checkoutLocal = this._checkoutLocal.getValue();
    const checkoutResponse = this._checkoutResponse.getValue();
    const user = this.nav.currentUser();

    if (!checkoutLocal || !checkoutResponse || !user) return;

    if (
      checkoutLocal.shippingOption == null ||
      (checkoutLocal.shippingOption == AddressOption.SHIPPING && !user.address)
    ) {
      this.goToShipping();
      return;
    }

    if (checkoutLocal.paymentOption == null) {
      this.goToPaymentOptions();
      return;
    }

    if (checkoutLocal.paymentOption == PaymentOption.CREDIT_CARD) {
      if (!checkoutLocal.cardId) {
        this.goToPaymentOptions();
        return;
      }

      if (!checkoutLocal.selectedInstallments || resetInstallments) {
        this.navigator.toInstallments();
        return;
      }
    }

    this.goToReview();
  }

  async storeCheckoutLocal(checkout: CheckoutLocal) {
    if (checkout && checkout.products && checkout.products.length) {
      await this.storage.set(
        'last_checkout',
        JSON.stringify({ ...checkout, paymentOption: null, couponCode: null }),
      );
    } else {
      await this.storage.remove('last_checkout');
    }
  }

  public getCartProductsTotal() {
    return this._checkoutLocal
      ?.getValue()
      ?.products.reduce((accum, product) => accum + product.cost, 0);
  }

  public async createCard(card: Card): Promise<Partial<Card>> {
    const res = await lastValueFrom(
      this.http.post<Partial<Card>>(`${this.urlApi}/payments/card`, card),
    );

    this.nav.syncUserData();
    this.analytics.addPaymentInfo();
    return res;
  }

  public async deleteCard(card: Card) {
    await lastValueFrom(
      this.http.delete(`${this.urlApi}/payments/card/${card._id}`),
    );

    await this.nav.syncUserData();
  }

  private mountBuyingPayload(): BuyingPayload | null {
    const checkoutLocal = this._checkoutLocal.getValue();
    const checkoutResponse = this._checkoutResponse.getValue();

    if (!checkoutLocal || !checkoutResponse) {
      this.feedback.info(
        'Erro',
        'Não foi possível montar o pedido. Tente novamente.',
      );
      return null;
    }

    const payload: BuyingPayload = new BuyingPayload();

    payload.clothesIds = checkoutLocal.products
      .map((item) => item._id)
      .filter((id): id is string => !!id);
    payload.shippingType = checkoutLocal.shippingOption;
    payload.paymentMethod = checkoutLocal.paymentOption;

    // mount coupon
    if (checkoutLocal.couponCode) payload.couponCode = checkoutLocal.couponCode;

    // set shipping info
    if (
      checkoutLocal.shippingOption === AddressOption.SHIPPING &&
      checkoutResponse.shipping.shippingValues
    ) {
      payload.shippingValues = {
        shippingCost: checkoutResponse.shipping.shippingValues.shippingCost,
        service: checkoutResponse.shipping.shippingValues.service,
      };
    }

    // mount for credit card
    if (checkoutLocal.paymentOption === PaymentOption.CREDIT_CARD) {
      payload.cardId = checkoutLocal.cardId;
      payload.installments = checkoutLocal.selectedInstallments;
    }

    return payload;
  }

  public async buy() {
    const ownerId = this._checkoutLocal.getValue()!.owner._id;
    const value = this.getCartProductsTotal();
    const payload = this.mountBuyingPayload();
    const items = this._checkoutLocal.getValue()!.products;

    if (!payload) return null;

    const res = await lastValueFrom(
      this.http.post<{ orderId: string }>(
        `${this.urlApi}/payments/buy`,
        payload,
      ),
    );

    setTimeout(
      () => this.reservePurchased(ownerId, res.orderId, value ?? 0, items),
      2000,
    );

    return res;
  }

  public getCheckoutData() {
    const { products, couponCode } = this._checkoutLocal.getValue()!;

    const params: Record<string, string | string[]> = {
      clothes: products
        .map((p: Clothes) => p._id)
        .filter((id): id is string => !!id),
      // add coupon code if exists
      ...(couponCode && { couponCode }),
    };

    return lastValueFrom(
      this.http
        .get<CheckoutResponse>(
          `${this.urlApi}/payments/checkout?t=${new Date().getTime()}`,
          {
            params,
          },
        )
        .pipe(
          tap((res) => {
            this._checkoutResponse.next(new CheckoutResponse(res));
          }),
        ),
    );
  }

  public reset() {
    this._checkoutLocal.next(null);
    this._checkoutResponse.next(null);
    this._reserves.next(null);
    this._baskets.next([]);
  }

  private removeUnavailable(products: Clothes[], basket: Basket) {
    products.forEach((p) => {
      p.owner = basket.owner._id;
      this.removeProduct(p);
    });
  }

  async reserveError(errors: any, basket: Basket) {
    const version: any[] = [];
    const status: any[] = [];

    errors.forEach((element: any) => {
      if (element.status) status.push(element);
      else if (element.__v) version.push(element);
    });

    if (version.length > 0) {
      const baskets = this._baskets.getValue();
      const foundBasket: Basket = baskets.find(
        (b) => b.owner._id === basket.owner._id,
      )!;

      const titles: string[] = [];

      version.forEach((el) => {
        const clothe = foundBasket.products.find((p) => p._id === el._id);
        if (clothe) titles.push(clothe.title);
      });

      this.removeUnavailable(version, basket);

      const strTitles = joinWithCommasAnd(titles);
      let msg;

      if (titles.length === 1)
        msg = `${basket.owner.seller?.storeName} alterou informações do anúncio ${strTitles}. Será preciso adicioná-lo novamente à sacola.`;
      else
        msg = `${basket.owner.seller?.storeName} alterou informações dos anúncios ${strTitles}. Será preciso adicioná-los novamente à sacola.`;

      this.feedback.info('Oh não!', msg);
    }

    if (status.length > 0) {
      const baskets = this._baskets.getValue();
      const foundBasket: Basket = baskets.find(
        (b) => b.owner._id === basket.owner._id,
      )!;

      const titles: string[] = [];

      status.forEach((el) => {
        const clothe = foundBasket.products.find((p) => p._id === el._id);
        if (clothe) titles.push(clothe.title);
      });

      this.removeUnavailable(status, basket);

      const strTitles = joinWithCommasAnd(titles);
      let msg;

      if (titles.length === 1)
        msg = `O produto ${strTitles} não está mais disponível`;
      else msg = `Os produtos ${strTitles} não estão mais disponíveis`;

      this.feedback.info('Oh não!', msg);
    }
  }
}
