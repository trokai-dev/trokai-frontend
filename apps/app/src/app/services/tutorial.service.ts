import { inject, Injectable } from '@angular/core';
import { StorageService } from '@trokai/shared-core';
import { ModalController, NavController } from '@ionic/angular/standalone';
import { BankPresentationComponent } from 'src/app/bank/bank-presentation/bank-presentation.component';
import { PostageLabelPresentationComponent } from 'src/app/orders/postage-label-presentation/postage-label-presentation.component';
import { PicturesHelpModalComponent } from '../new-item/pictures-help-modal/pictures-help-modal.component';

@Injectable({
  providedIn: 'root',
})
export class TutorialService {
  private modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);
  private storage = inject(StorageService);

  async didPresent(key: string): Promise<boolean> {
    if (await this.storage.has(key)) return true;

    await this.storage.set(key, 'true');

    return false;
  }

  async bankPresentation() {
    if (await this.didPresent('bank_presentation')) return;

    const modal = await this.modalCtrl.create({
      component: BankPresentationComponent,
    });

    modal.present();
  }

  async productRegisterTutorial(force = false) {
    if (!force && (await this.didPresent('product_pictures_dialog'))) return;

    const modal = await this.modalCtrl.create({
      component: PicturesHelpModalComponent,
      cssClass: ['modal-product-tips', 'modal-70'],
    });

    modal.present();

    return await modal.onDidDismiss();
  }

  async onboardingPresentation() {
    if (await this.didPresent('onboarding_presentation')) return;

    // this.navCtrl.navigateForward('/presentation');
  }

  async postageLabelTutorial() {
    if (await this.didPresent('postage_tutorial')) return;

    const modal = await this.modalCtrl.create({
      component: PostageLabelPresentationComponent,
    });

    modal.present();

    await modal.onDidDismiss();

    return;
  }
}
