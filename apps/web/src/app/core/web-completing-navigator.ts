import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { filter, firstValueFrom, take } from 'rxjs';
import {
  ClothesStatus,
  CompletingType,
  SellerProfileStatus,
  SellerStatus,
} from '@trokai/shared-core';
import { CompletingNavigator, UserService } from '@trokai/shared-data-access';
import { AlertService } from '@trokai/shared-ui';
import { GlobalService } from '../services/global.service';
import { InventoryService } from '../wardrobe/inventory.service';

/** Web completion gates — Angular Router routes (+ query params) and Material alerts. */
@Injectable()
export class WebCompletingNavigator extends CompletingNavigator {
  private router = inject(Router);
  private userService = inject(UserService);
  private alert = inject(AlertService);
  private globalService = inject(GlobalService);
  private inventoryService = inject(InventoryService);

  resetSellDraft(): void {
    this.inventoryService.resetItem();
  }

  async gate(action: CompletingType): Promise<boolean> {
    const sell = action === CompletingType.SELL;
    const user = await this.userService.getUserInfo();
    const status = user.accountCompletion();

    // 1. Informações pessoais incompletas (TODOS)
    if (!status.personalInfo) {
      this.goTo('/account/profile?completing=true');
      this.alert.alert('Complete o seu cadastro');
      return true;
    }

    // 2. ainda não iniciou o onboarding de vendedor
    if (sell && !user.isSeller()) {
      this.goTo('/seller-onboarding');
      return true;
    }

    // 3. usuário sem endereço (compra valida no checkout)
    if (!status.address && sell) {
      this.goTo('/account/address?completing=true');
      this.alert.alert('Cadastre seu endereço para prosseguir');
      return true;
    }

    // 4. falta verificação de telefone (VENDEDOR)
    if (!status.phoneVerified && sell) {
      this.goTo('/account/profile?phone-verify=true');
      this.alert.alert('Verifique seu telefone');
      return true;
    }

    // 5. faltam store options (VENDEDOR)
    if (!status.sellerInfo && sell) {
      this.goTo('/account/wardrobe?completing=true');
      this.alert.alert('Complete o cadastro da sua loja');
      return true;
    }

    // 6. conta em análise (PENDING_REVIEW) — bloqueia além do mínimo
    if (
      sell &&
      user.sellerStatus === SellerStatus.ONBOARDING &&
      user.sellerProfileStatus === SellerProfileStatus.PENDING_REVIEW
    ) {
      const params = await firstValueFrom(
        this.globalService.params.pipe(filter(Boolean), take(1)),
      );
      const minClothes = params?.minClothesToSell || 5;
      const pendingCount =
        user.clothesSummary?.find(
          (s) =>
            s.status === ClothesStatus.WAITING_PUBLICATION ||
            s.status === ClothesStatus.WAITING_ADJUSTMENT ||
            s.status === ClothesStatus.PAUSED_BY_USER ||
            s.status === ClothesStatus.PUBLISHED,
        )?.count ?? 0;

      if (pendingCount >= minClothes) {
        await this.alert.showDialog(
          'Conta em análise',
          `Sua conta está em análise. Durante esse período, você só pode cadastrar as ${minClothes} peças mínimas necessárias.`,
        );
        this.goTo('/account/seller-status');
        return true;
      }
    }

    return false;
  }

  async toSellRegister(): Promise<void> {
    this.router.navigateByUrl('/sell');
  }

  private goTo(url: string) {
    this.router.navigateByUrl(url, { replaceUrl: true });
  }
}
