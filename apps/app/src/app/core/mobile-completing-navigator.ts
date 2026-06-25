import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { CompletingType, FeedbackService } from '@trokai/shared-core';
import { CompletingNavigator, UserService } from '@trokai/shared-data-access';
import { InventoryService } from '../services/inventory.service';
import { TutorialService } from '../services/tutorial.service';

/** Mobile completion gates — app routes, toasts and the Ionic register flow. */
@Injectable()
export class MobileCompletingNavigator extends CompletingNavigator {
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private userService = inject(UserService);
  private feedback = inject(FeedbackService);
  private inventoryService = inject(InventoryService);
  private tutorialService = inject(TutorialService);

  resetSellDraft(): void {
    this.inventoryService.resetItem();
  }

  async gate(action: CompletingType): Promise<boolean> {
    const sell = action === CompletingType.SELL;
    const user = await this.userService.getUserInfo();
    const status = user.accountCompletion();

    // 1. Informações pessoais incompletas (TODOS)
    if (!status.personalInfo) {
      this.goTo('/profile-completing');
      this.feedback.warning('Complete o seu cadastro');
      return true;
    }

    // 2. Falta verificação de telefone (VENDEDOR)
    if (!status.phoneVerified && sell) {
      this.goTo('/phone-verification');
      this.feedback.warning('Verifique seu telefone');
      return true;
    }

    // 3. Faltam store options (VENDEDOR)
    if (!status.sellerInfo && sell) {
      this.goTo('/store-completing');
      this.feedback.warning('Complete o cadastro do seu brechó');
      return true;
    }

    // 4. usuário sem endereço
    if (!status.address) {
      this.goTo('/address-completing');
      this.feedback.warning('Cadastre seu endereço para prosseguir');
      return true;
    }

    return false;
  }

  async toSellRegister(): Promise<void> {
    this.navCtrl.navigateForward('/new-item/register');
    await this.tutorialService.productRegisterTutorial();
  }

  private goTo(url: string) {
    this.router.navigateByUrl(url, { replaceUrl: true });
  }
}
