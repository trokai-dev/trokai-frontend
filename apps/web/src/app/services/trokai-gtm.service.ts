import { Clothes, GtmProductData } from '@trokai/shared-core';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { AuthService } from '../auth/auth.service';
import { environment } from 'src/environments/environment';

enum GtmEvents {
  USER_IDENTIFY = 'user_identify',
  USER_LOGOUT = 'user_logout',
  VIEW_PRODUCT = 'view_product',
  ADD_TO_CART = 'add_to_cart',
  BEGIN_CHECKOUT = 'begin_checkout',
  ADD_PAYMENT_INFO = 'add_payment_info',
  PURCHASE = 'purchase',
}

@Injectable({
  providedIn: 'root',
})
export class TrokaiGtmService {
  private gtmService = inject(GoogleTagManagerService);
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  // Controle de debounce para evitar cliques duplos acidentais (500ms)
  private lastEvents: { [key: string]: number } = {};
  private readonly DEBOUNCE_TIME = 500;

  private _gtmReady = false;
  private _pendingTags: object[] = [];

  public get hasConsent() {
    return (
      isPlatformBrowser(this.platformId) &&
      !!localStorage.getItem('accepted_cookies')
    );
  }

  /**
   * Verifica se pode disparar o evento (proteção contra double-click rápido)
   */
  private canFire(eventName: string): boolean {
    if (!isPlatformBrowser(this.platformId) || !environment.production)
      return false;

    const now = Date.now();
    const lastFired = this.lastEvents[eventName] || 0;

    if (now - lastFired < this.DEBOUNCE_TIME) {
      return false;
    }

    this.lastEvents[eventName] = now;
    return true;
  }

  public addGtmToDom() {
    if (isPlatformBrowser(this.platformId)) {
      // Run the script injection outside Angular
      this.ngZone.runOutsideAngular(() => {
        this.gtmService.addGtmToDom().then(() => {
          this._gtmReady = true;
          this._pendingTags.forEach((tag) => this.pushToDataLayer(tag));
          this._pendingTags = [];
        });
      });
    }
  }

  // Helper method to push tags without blocking Angular's stability
  private pushToDataLayer(tag: object) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      // 1. Get the native window object
      const windowObj = window as unknown as { dataLayer?: unknown[] };

      // 2. Push directly to the array.
      // This is synchronous and bypasses the library's Promise logic entirely.
      if (windowObj.dataLayer) {
        windowObj.dataLayer.push(tag);
      } else {
        // Fallback: if dataLayer isn't init'd yet, use the library
        this.gtmService.pushTag(tag).catch(() => {
          /* intentional */
        });
      }
    });
  }

  /**
   * Chamar assim que o usuário fizer Login ou o App carregar logado.
   * Envia dados para o GA4 unir sessões e para a Meta fazer o Advanced Matching.
   */
  identifyUser() {
    if (!this.hasConsent) return;
    if (!this.canFire(GtmEvents.USER_IDENTIFY)) return;

    const userData = this.authService.getUserValue();
    if (!userData) return;

    const tag = {
      event: GtmEvents.USER_IDENTIFY,
      ...this.getUserContext(),
    };

    // Use the helper!
    // This pushes outside the zone so it won't block stability.
    this.pushToDataLayer(tag);
  }

  /**
   * Limpa os dados do usuário do DataLayer ao fazer logout.
   * Essencial para SPAs (Angular) para evitar misturar dados de usuários.
   */
  logoutEvent() {
    if (!this.hasConsent) return;
    if (!this.canFire(GtmEvents.USER_LOGOUT)) return;

    const tag = {
      event: GtmEvents.USER_LOGOUT,
      user_id: null as string | null, // Zera o ID no GA4
      user_data: null as { email?: string; phone?: string } | null, // Zera os dados pessoais (email/phone) no Meta
    };

    // Use o helper para garantir que não bloqueie a navegação
    this.pushToDataLayer(tag);
  }

  // --- EVENTOS DE E-COMMERCE ---

  viewProductEvent(productData: Clothes) {
    if (!this.canFire(GtmEvents.VIEW_PRODUCT)) return;

    const tag = {
      event: GtmEvents.VIEW_PRODUCT,
      ecommerce: {
        items: [new GtmProductData(productData)],
        value: productData.cost / 100,
        currency: 'BRL',
      },
      ...this.getUserContext(),
    };

    if (!this._gtmReady) {
      this._pendingTags.push(tag);
      return;
    }

    // Call the helper instead of awaiting the service directly
    this.pushToDataLayer(tag);
  }

  addToCartEvent(productData: Clothes) {
    if (!this.canFire(GtmEvents.ADD_TO_CART)) return;

    const tag = {
      event: GtmEvents.ADD_TO_CART,
      ecommerce: {
        items: [new GtmProductData(productData)],
        value: productData.cost / 100,
        currency: 'BRL',
      },
      ...this.getUserContext(), // Adiciona contexto do usuário se disponível
    };

    if (!this._gtmReady) {
      this._pendingTags.push(tag);
      return;
    }

    // Call the helper instead of awaiting the service directly
    this.pushToDataLayer(tag);
  }

  beginCheckoutEvent(cartTotal: number, items: Clothes[]) {
    // Aqui não tem problema disparar múltiplas vezes se o user for e voltar
    if (!this.canFire(GtmEvents.BEGIN_CHECKOUT)) return;

    const tag = {
      event: GtmEvents.BEGIN_CHECKOUT,
      ecommerce: {
        currency: 'BRL',
        value: cartTotal / 100,
        items: items.map((item) => new GtmProductData(item)),
      },
      ...this.getUserContext(), // Adiciona contexto do usuário se disponível
    };

    if (!this._gtmReady) {
      this._pendingTags.push(tag);
      return;
    }

    // Call the helper instead of awaiting the service directly
    this.pushToDataLayer(tag);
  }

  addPaymentInfoEvent() {
    if (!this.canFire(GtmEvents.ADD_PAYMENT_INFO)) return;
    const tag = {
      event: GtmEvents.ADD_PAYMENT_INFO,
      ...this.getUserContext(),
    };
    this.pushToDataLayer(tag);
  }

  purchaseEvent(orderId: string, valueBRL: number, items: Clothes[]) {
    // Purchase é crítico, geralmente não se bloqueia, mas o debounce de 500ms
    // ajuda se o botão "Finalizar" não desabilitar rápido o suficiente na UI.
    if (!this.canFire(GtmEvents.PURCHASE)) return;

    const tag = {
      event: GtmEvents.PURCHASE,
      ecommerce: {
        transaction_id: orderId,
        value: valueBRL / 100,
        currency: 'BRL',
        items: items.map((item) => new GtmProductData(item)),
      },
      ...this.getUserContext(), // Adiciona contexto do usuário se disponível
    };

    if (!this._gtmReady) {
      this._pendingTags.push(tag);
      return;
    }

    // Call the helper instead of awaiting the service directly
    this.pushToDataLayer(tag);
  }

  private getUserContext() {
    if (!this.hasConsent) return null;

    const user = this.authService.getUserValue(); // Seu método de pegar usuário da memória
    if (!user) return null;

    return {
      user_id: user._id, // Para o GA4 (Sessão unificada)
      user_data: {
        // Para o Facebook (Advanced Matching)
        email_address: user.email,
        phone_number: `55${user.phone}`, // Opcional, mas recomendado
      },
    };
  }
}
