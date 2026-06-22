import { Address, User } from '@trokai/shared-core';
import { TkAddressFormComponent } from '@trokai/shared-ui';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import {
  IonContent,
  IonHeader,
  IonNav,
  IonSpinner,
  IonTitle,
  IonToolbar,
  LoadingController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { CompletingInformationService } from '@trokai/shared-data-access';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [
    BackButtonComponent,
    TkAddressFormComponent,
    IonHeader,
    IonToolbar,
    IonSpinner,
    MatButtonModule,
    IonTitle,
    IonContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar mode="ios">
        <app-back-button
          [nav]="buyingChangeAddress"
          [blockNavigation]="completingInformation"
          (onClick)="back()"
          defaultHref="/main/profile"
        />
        <ion-title>{{
          completingInformation ? 'Insira seu endereço' : 'Endereço'
        }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      @if (!user) {
        <div class="w-full flex justify-center mt-56">
          <ion-spinner></ion-spinner>
        </div>
      }
      @if (user) {
        <div class="p-24">
          <tk-address-form
            [address]="userAddress"
            [submit]="false"
            (addressSave)="onAddressSave($event)"
          />
          <div class="mt-56">
            <button
              mat-flat-button
              [disabled]="!formRef?.form.valid"
              (click)="formRef?.save()"
              color="primary"
              class="action-button w-full round"
            >
              {{ getStringButton() }}
            </button>
            @if (buyingChangeAddress && zipShipping) {
              <button
                mat-stroked-button
                (click)="useRegisteredAddress()"
                color="primary"
                class="action-button w-full mt-16 round"
              >
                Usar endereço cadastrado
              </button>
            }
          </div>
        </div>
      }
    </ion-content>
  `,
})
export class AddressPage implements OnInit, OnDestroy {
  private firebaseService = inject(FirebaseService);
  private navCtrl = inject(NavController);
  private platform = inject(Platform);
  private completingInfoService = inject(CompletingInformationService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private loadingCtrl = inject(LoadingController);
  private navParams = inject(NavParams, { optional: true });
  private ionNav = inject(IonNav, { optional: true });

  @ViewChild(TkAddressFormComponent) formRef?: TkAddressFormComponent;

  user?: User;
  userAddress?: Address;
  completingInformation = false;
  buyingChangeAddress = false;
  zipShipping: number | null = null;

  private backNavSub?: Subscription;

  ngOnInit() {
    this.buyingChangeAddress = !!this.navParams?.data?.buying;
    this.completingInformation = this.router.url === '/address-completing';
    if (this.navParams?.data?.zip) this.zipShipping = this.navParams.data.zip;

    this.authService.user.subscribe((u) => {
      if (u) {
        this.user = u;
        if (u.address && !this.formRef?.form.valid) {
          if (this.buyingChangeAddress && this.zipShipping) {
            setTimeout(() => {
              this.formRef?.form.patchValue({
                zipCode: this.zipShipping?.toString(),
              });
              this.formRef?.onChangeCEP();
            }, 300);
          } else {
            this.userAddress = u.address;
          }
        }
      }
    });

    this.backNavSub = this.platform.backButton.subscribeWithPriority(90, () =>
      this.back(),
    );
  }

  getStringButton() {
    if (this.completingInformation) return 'Continuar';
    if (this.buyingChangeAddress) return 'Alterar meu endereço';
    return 'Salvar';
  }

  async onAddressSave(address: Address) {
    const loading = await this.loadingCtrl.create({ message: 'Salvando...' });
    loading.present();
    try {
      const _user = new User();
      _user.address = address;
      await this.authService.updateUser(_user);

      if (this.completingInformation) {
        this.completingInfoService.next();
        this.firebaseService.log('COMPLETA_ENDERECO_OK');
      } else if (this.buyingChangeAddress && this.navParams) {
        this.ionNav?.pop();
      } else {
        this.navCtrl.pop();
      }
    } catch {
      /* intentional */
    } finally {
      loading.dismiss();
    }
  }

  useRegisteredAddress() {
    this.ionNav?.pop();
  }

  back() {
    if (this.buyingChangeAddress) this.ionNav?.pop();
    else this.navCtrl.back();
  }

  ngOnDestroy() {
    this.backNavSub?.unsubscribe();
  }
}
