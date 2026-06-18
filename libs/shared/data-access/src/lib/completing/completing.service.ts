import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  APP_CONFIG,
  CompletingType,
  FeedbackService,
  NavigationManager,
  StorageService,
} from '@trokai/shared-core';
import { lastValueFrom } from 'rxjs';
import { BuyingService } from '../buying/buying.service';
import { CompletingNavigator } from './completing.platform';

interface StoredAction {
  action: CompletingType;
  ownerIdForPurchase: string | null;
}

/**
 * Platform-agnostic "complete your account before you can buy/sell" flow.
 * Orchestration only — the gate sequence, redirect routes and sell destination
 * are platform-specialized behind the injected `CompletingNavigator`.
 */
@Injectable({ providedIn: 'root' })
export class CompletingInformationService {
  private http = inject(HttpClient);
  private urlApi = inject(APP_CONFIG).urlApi;
  private nav = inject(NavigationManager);
  private buyingService = inject(BuyingService);
  private feedback = inject(FeedbackService);
  private storage = inject(StorageService);
  private navigator = inject(CompletingNavigator);

  private originalAction: CompletingType | null = null;
  ownerIdForPurchase: string | null = null;

  get hasFlow() {
    return !!this.originalAction;
  }

  verifyUserStatus() {
    return lastValueFrom(
      this.http.get<any>(`${this.urlApi}/users/me/verify-status`),
    );
  }

  sendVerifyEmail() {
    return lastValueFrom(
      this.http.post<any>(`${this.urlApi}/users/send-verify-email`, {}),
    );
  }

  openSellerAccount() {
    return lastValueFrom(
      this.http.post<any>(`${this.urlApi}/users/open-seller-account`, {}),
    );
  }

  async tryStartPurchase(ownerId: string) {
    this.setAction(CompletingType.PURCHASE, ownerId);
    return this.execute();
  }

  /** Gate the sell flow without auto-navigating (web opens the page via URL). */
  async canRegisterProduct() {
    this.navigator.resetSellDraft();
    this.setAction(CompletingType.SELL);
    return this.execute(false);
  }

  /** Gate the sell flow and navigate to register on success (app). */
  async tryRegisterProduct() {
    this.navigator.resetSellDraft();
    this.setAction(CompletingType.SELL);
    return this.execute(true);
  }

  async next() {
    if (this.originalAction == null) return;
    await this.execute();
  }

  async restoreAction() {
    const stored = await this.storage.getObject<StoredAction>(
      'completingAction',
    );
    if (!stored) return;

    try {
      this.originalAction = stored.action;
      this.ownerIdForPurchase = stored.ownerIdForPurchase;
      if (this.originalAction != CompletingType.PURCHASE) return; // só navega se for compra
      await this.execute();
    } catch {
      this.reset();
    }
  }

  reset() {
    this.originalAction = null;
    this.ownerIdForPurchase = null;
    void this.storage.remove('completingAction');
  }

  private setAction(
    action: CompletingType,
    ownerIdForPurchase: string | null = null,
  ) {
    this.originalAction = action;
    this.ownerIdForPurchase = ownerIdForPurchase;
    void this.storage.setObject('completingAction', {
      action,
      ownerIdForPurchase,
    });
  }

  private async execute(navigateToAction = true): Promise<boolean> {
    if (!this.nav.ensureAuthenticated()) return false;

    this.feedback.startLoading();
    let redirected: boolean;
    try {
      redirected = await this.navigator.gate(this.originalAction!);
    } finally {
      this.feedback.stopLoading();
    }
    if (redirected) return false;

    if (navigateToAction) await this.goToAction();
    this.reset();
    return true;
  }

  private async goToAction() {
    switch (this.originalAction) {
      case CompletingType.PURCHASE:
        if (this.ownerIdForPurchase)
          this.buyingService.openCheckout(this.ownerIdForPurchase);
        break;
      case CompletingType.SELL:
        await this.navigator.toSellRegister();
        break;
    }
  }
}
