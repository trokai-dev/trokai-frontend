import { ClothesStatus, User } from '@trokai/shared-core';
import { Clothes } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Share } from '@capacitor/share';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Basket, BuyingService } from '@trokai/shared-data-access';
import { InventoryService } from '../services/inventory.service';
import { ClothesPayment } from '@trokai/shared-data-access';
import { RequiredAdjustsComponent } from '../wardrobe/required-adjusts/required-adjusts.component';
import { StatusPillComponent, StatusPillVariant, ItemNamePipe, CostPipe } from '@trokai/shared-ui';
import { MainService } from '../services/main.service';
import { SearchService } from '../services/search.service';
import Swiper from 'swiper';
import { MatDialog } from '@angular/material/dialog';
import { TkGalleryComponent } from '@trokai/shared-ui';
import { Filters, GlobalParams } from '@trokai/shared-core';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import { NgClass, CurrencyPipe } from '@angular/common';
import { TkLikeButtonComponent } from '@trokai/shared-ui';
import { TkZipcodeShippingFeeComponent as ZipcodeShippingFeeComponent } from '@trokai/shared-ui';
import { TkReviewStarsComponent } from '@trokai/shared-ui';
import { TkProductCardComponent } from '@trokai/shared-ui';
import {
  IonContent,
  IonGrid,
  IonHeader,
  IonicSlides,
  IonSpinner,
  IonTitle,
  IonToolbar,
  LoadingController,
  ModalController,
  NavController,
  IonButton,
  IonIcon,
  IonButtons,
  ActionSheetController,
  IonList,
  IonRippleEffect,
  IonLabel,
  IonBadge,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircle,
  alertCircleOutline,
  arrowUndo,
  cartOutline,
  cashOutline,
  chevronForward,
  close,
  closeCircle,
  copyOutline,
  createOutline,
  ellipsisHorizontal,
  pauseOutline,
  playOutline,
  refreshOutline,
  resize,
  shareSocial,
  shieldCheckmark,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';
import { AlertService, TkUserAvatarComponent } from '@trokai/shared-ui';
import { FirebaseService } from '../services/firebase.service';
import { GlobalService } from '../services/global.service';
import { ProductService } from '@trokai/shared-data-access';
import { ToastService } from '../services/toast-service';
import { ReserveTimeComponent } from '../buying/reserve-time/reserve-time.component';
import { CompletingInformationService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonText,
    IonBadge,
    IonButtons,
    IonIcon,
    IonButton,
    IonHeader,
    IonList,
    IonRippleEffect,
    TkUserAvatarComponent,
    IonLabel,
    IonToolbar,
    IonContent,
    IonGrid,
    IonTitle,
    IonSpinner,
    BackButtonComponent,
    TkLikeButtonComponent,
    NgClass,
    ZipcodeShippingFeeComponent,
    TkReviewStarsComponent,
    TkProductCardComponent,
    CurrencyPipe,
    CostPipe,
    ReserveTimeComponent,
    StatusPillComponent,
    ItemNamePipe,
  ],
})
export class ProductPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private firebaseService = inject(FirebaseService);
  private globalService = inject(GlobalService);
  private mainService = inject(MainService);
  public inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);
  private navCtrl = inject(NavController);
  private searchService = inject(SearchService);
  private loadingCtrl = inject(LoadingController);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private buyingService = inject(BuyingService);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private matDialog = inject(MatDialog);
  private productsService = inject(ProductService);
  private actionSheetController = inject(ActionSheetController);
  private ngZone = inject(NgZone);
  private completingInformation = inject(CompletingInformationService);

  swiperModules = [IonicSlides];
  swiperInstance: Swiper;

  @ViewChild('swiper')
  set swiper(swiperRef: ElementRef) {
    if (this.product)
      setTimeout(() => (this.swiperInstance = swiperRef.nativeElement.swiper));
  }

  productId;
  product?: { clothes: Clothes; payment: ClothesPayment };
  owner: User;

  user: User;
  justLiked = null;

  reserves;

  questionsWithoutAnswer = 0;

  myProduct = false;

  waiting_adjustment = false;
  waiting_publication = false;
  reserved = false;
  published = false;
  sold = false;
  selling = false;
  expired = false;
  paused = false;
  unavailable = false;

  displayQuestions = [];

  tabUrl = null;


  adjusts = null;
  expiration = null;
  params: GlobalParams = null;

  showRenew = false;
  isInReserves = null;
  reservesSub: Subscription;
  firstStart = true;

  deliveryString = '';
  otherClothes = [];

  // cart
  product_in_basket = false;
  wardrobe_basket = false;
  wardrobe_reserved = false;

  baskets: Basket[] = [];
  basketCount = 0;
  statusText;

  get statusVariant(): StatusPillVariant {
    if (this.sold) return 'success';
    if (this.reserved || this.selling || this.unavailable) return 'muted';
    if (this.myProduct && this.waiting_adjustment) return 'warning';
    if (this.myProduct && this.expired) return 'danger';
    if (this.myProduct && this.paused) return 'muted';
    return 'neutral';
  }

  ngOnInit() {
    this.tabUrl = this.router.url.includes('home') ? 'home' : 'search';
    addIcons({
      alertCircle,
      chevronForward,
      closeCircle,
      shareSocial,
      resize,
      timeOutline,
      cashOutline,
      alertCircleOutline,
      cartOutline,
      shieldCheckmark,
      createOutline,
      copyOutline,
      trashOutline,
      ellipsisHorizontal,
      pauseOutline,
      playOutline,
      arrowUndo,
      refreshOutline,
    });

    this.productId = this.route.snapshot.paramMap.get('product_id');

    this.authService.user.subscribe((user) => {
      this.user = user;
      this.mountStatus();
    });

    this.reservesSub = this.buyingService.reserves$.subscribe((clothes) => {
      if (!clothes) return;

      const isReserved = !!clothes.find((el) => el._id === this.productId);

      if (this.isInReserves != null && this.isInReserves !== isReserved)
        this.start();

      this.isInReserves = isReserved;
    });

    this.globalService.clothesAdjusts().subscribe((items) => {
      this.adjusts = items;
    });

    this.globalService.params().subscribe((params) => {
      this.params = params;
      this.mountExpiration();
    });

    this.start().then(() => {
      this.buyingService.baskets$.subscribe((baskets) => {
        this.baskets = baskets;
        this.processBaskets();
      });
    });
  }

  processBaskets() {
    if (!this.baskets || !this.baskets.length || !this.owner) {
      this.product_in_basket = false;
      this.wardrobe_basket = false;
      this.wardrobe_reserved = false;
      this.basketCount = 0;
      return;
    }

    this.basketCount = this.baskets.reduce((acc, basket) => {
      return acc + basket.products.length;
    }, 0);

    const basket = this.baskets.find((b) => b.owner._id === this.owner._id);

    if (basket) {
      // check if there is basket for the wardrobe
      this.wardrobe_basket = true;
      // check if this product is in basket
      this.product_in_basket = basket.products.some(
        (product) => product._id === this.product.clothes._id,
      );
      this.wardrobe_reserved = basket.reserved;
    } else {
      this.product_in_basket = false;
      this.wardrobe_basket = false;
      this.wardrobe_reserved = false;
    }
  }

  async mountExpiration() {
    if (this.expired) this.showRenew = true;

    if (!this.published) return;

    this.expiration = this.globalService.mountExpiration(
      this.product.clothes.updatedAt,
      this.params.daysToExpireClothes,
    );
    this.showRenew = this.expiration?.days <= 5;
  }

  mountDeliveryString() {
    if (this.owner.inPerson && this.owner.shipping) {
      this.deliveryString = 'Correios ou retirada presencial';
    } else if (this.owner.inPerson) {
      this.deliveryString = 'Apenas retirada presencial';
    } else {
      this.deliveryString = 'Receba em casa pelos correios';
    }
  }

  async start() {
    try {
      this.product = await this.productsService.fetchCompleteProduct(
        this.productId,
      );

      this.owner = await this.searchService.getUserInfo(
        this.product.clothes.owner,
      );

      this.mountStatus();

      if (
        !this.myProduct &&
        (this.expired || this.waiting_adjustment || this.waiting_publication)
      )
        throw new Error('Status not allowed');

      this.mountDeliveryString();

      await this.getSuggestionClothes();

      if (this.product.clothes.questions)
        this.questionsWithoutAnswer = this.product.clothes.questions.length;

      this.displayQuestions = this.myProduct
        ? this.product.clothes.questions
        : this.product.clothes.questions.filter(
            (q) => q.answer || q.questioner === this.user?._id,
          );

      if (!this.myProduct && this.user && this.firstStart)
        this.productsService.visitItem(this.productId).subscribe();

      this.firstStart = false;
    } catch (err) {
      this.toastService.makeToast('Produto não encontrado!');
      this.navCtrl.back();
    }
  }

  async getSuggestionClothes() {
    const exclude_suggestions = [this.product.clothes._id]; // exclude the current product
    const baskets = this.buyingService.getBasketFromOwner(this.owner._id);

    if (baskets)
      // exclude the products in the basket of the owner
      exclude_suggestions.push(...baskets.products.map((p) => p._id));

    const filter = { status: ClothesStatus.PUBLISHED } as Filters;

    const res = await this.searchService.getClothesOfUser(
      this.owner._id,
      0,
      5,
      filter,
      exclude_suggestions,
    );

    this.otherClothes = res.clothes;
  }

  mountStatus() {
    if (!this.product) return;

    const status = this.product.clothes.status;

    this.waiting_adjustment = status === ClothesStatus.WAITING_ADJUSTMENT;
    this.waiting_publication = status === ClothesStatus.WAITING_PUBLICATION;
    this.reserved = status === ClothesStatus.RESERVED;
    this.published = status === ClothesStatus.PUBLISHED;
    this.sold = status === ClothesStatus.SOLD;
    this.selling = status === ClothesStatus.NEGOTIATING_SELL;
    this.expired = status === ClothesStatus.EXPIRED;

    this.unavailable =
      status === ClothesStatus.ANALYSIS_REPROVED ||
      status === ClothesStatus.DELETED_BY_USER;

    this.paused = status === ClothesStatus.PAUSED_BY_USER;

    this.myProduct =
      this.user && this.owner && this.user._id === this.owner._id;

    this.statusText = this.getStatusText();

    this.mountExpiration();
  }

  clickCart() {
    this.mainService.navigateToCarts(this.owner._id);
  }

  async clickOptions() {
    if (!this.myProduct) return;

    const buttons = [];

    // waiting adjustments
    if (this.waiting_adjustment) {
      buttons.push({
        text: 'Corrigir anúncio',
        icon: alertCircleOutline,
        handler: () => {
          this.ngZone.run(() => {
            this.modalAdjusts();
          });
        },
      });
    }

    // show renew if expired
    if (this.showRenew) {
      buttons.push({
        text: 'Renovar anúncio',
        icon: refreshOutline,
        handler: () => {
          this.ngZone.run(() => {
            this.renewProduct();
          });
        },
      });
    }

    if (!this.waiting_adjustment && !this.showRenew && !this.sold) {
      buttons.push({
        text: 'Editar',
        icon: createOutline,
        handler: () => {
          this.ngZone.run(() => {
            this.editProduct();
          });
        },
      });
    }

    // allow duplicate if not waiting adjustment or expired
    if (
      !this.waiting_adjustment &&
      !this.expired &&
      !this.waiting_publication
    ) {
      buttons.push({
        text: 'Duplicar',
        icon: copyOutline,
        handler: () => {
          this.ngZone.run(() => {
            this.duplicateProduct();
          });
        },
      });
    }

    // deactivate if published
    if (this.published) {
      buttons.push({
        text: 'Pausar',
        icon: pauseOutline,
        handler: () => {
          this.ngZone.run(() => {
            this.deactivateProduct();
          });
        },
      });
    }

    // activate if paused
    if (this.paused) {
      buttons.push({
        text: 'Ativar',
        icon: playOutline,
        handler: () => {
          this.ngZone.run(() => {
            this.activateProduct();
          });
        },
      });
    }

    // delete if published, expired or waiting adjustment
    if (
      this.waiting_publication ||
      this.waiting_adjustment ||
      this.published ||
      this.paused ||
      this.expired
    ) {
      buttons.push({
        text: 'Excluir',
        icon: trashOutline,
        handler: () => {
          this.ngZone.run(() => {
            this.deleteProduct();
          });
        },
      });
    }

    buttons.push({
      text: 'Cancelar',
      icon: close,
      role: 'cancel',
      handler: () => { /* intentional */ },
    });

    const ac = await this.actionSheetController.create({
      buttons: buttons,
    });

    ac.present();
  }

  async clickBuy() {
    this.firebaseService.log('COMPRA_CLICOU_COMPRAR');
    this.toastService.makeToast('Produto adicionado à sacola!');
    this.buyingService.addProduct(this.owner, this.product.clothes);
    // this.mainService.navigateToCarts(this.owner._id);
  }

  removeFromBasket() {
    this.buyingService.removeProduct(this.product.clothes);
  }

  async openCheckout(ownerId: string) {
    this.completingInformation.tryStartPurchase(ownerId);
  }

  openOwnerWardrobe() {
    // abrir armario
    this.mainService.navigateToWardrobe(this.owner._id);
    this.firebaseService.log('PRODUCT_ABRIU_ARMARIO');
  }

  openAnotherProduct(p) {
    // abrir outro produto
    this.mainService.navigateToProduct(p._id);
    this.firebaseService.log('PRODUCT_ABRIU_SUGESTAO');
  }

  openQuestion(q) {
    this.firebaseService.log('PRODUCT_ABRIU_PERGUNTAS');
    this.mainService.navigateToQuestion(this.productId, q._id);
  }

  askQuestion() {
    if (!this.authService.checkLogged()) return;
    this.firebaseService.log('PRODUCT_ABRIU_PERGUNTAS');
    this.mainService.navigateToQuestion(this.productId);
  }

  async share() {
    let text = '';

    text = this.product.clothes.title + '. Veja este produto no Trokaí';

    await Share.share({
      title: this.product.clothes.title,
      text: text,
      url:
        'https://www.trokai.com.br' +
        this.globalService.mountProductLink(this.product.clothes),
      dialogTitle: 'Compartilhar anúncio',
    });

    if (this.myProduct) this.firebaseService.log('SHARE_ROUPA_USER');
    else this.firebaseService.log('SHARE_ROUPA_OUTRO');
  }

  async deleteProduct() {
    if (!this.myProduct) return;

    const answer = await this.alertService.askQuestion(
      'Excluir anúncio?',
      'Essa ação não pode ser desfeita.',
      'Excluir',
    );
    if (answer) {
      const loading = await this.loadingCtrl.create({
        keyboardClose: true,
        message: 'Excluindo anúncio..',
      });

      loading.present();

      try {
        await this.inventoryService.deleteItem(this.product.clothes);
        this.navCtrl.pop();
        this.toastService.makeToast('Anúncio excluido');
      } finally {
        loading.dismiss();
      }
    }
  }

  async editProduct() {
    if (!this.product || !this.myProduct) return;

    const status = this.product.clothes.status;

    if (
      !(
        status === ClothesStatus.PUBLISHED ||
        status === ClothesStatus.WAITING_ADJUSTMENT ||
        status === ClothesStatus.WAITING_PUBLICATION ||
        status === ClothesStatus.EXPIRED ||
        status === ClothesStatus.PAUSED_BY_USER
      )
    ) {
      this.toastService.makeToast('Não é possível editar esse anúncio.');
      return;
    }

    await this.inventoryService.startEditing(this.product.clothes);
    this.navCtrl.navigateForward('/new-item/register');
  }

  async duplicateProduct() {
    if (!this.product || !this.myProduct) return;
    await this.inventoryService.startDuplicate(this.product.clothes);
    this.navCtrl.navigateForward('/new-item/register');
  }

  async deactivateProduct() {
    if (!this.myProduct) return;
    await this.inventoryService.deactivateProduct(this.productId);
    this.toastService.makeToast('Anúncio pausado');
    this.start();
  }

  async activateProduct() {
    if (!this.myProduct) return;
    await this.inventoryService.activateProduct(this.productId);
    this.toastService.makeToast('Anúncio ativado');
    this.start();
  }

  async renewProduct() {
    const res = await this.alertService.askQuestion(
      'Renovar anúncio',
      'Deseja editar o anúncio antes de renovar?',
      'Editar primeiro',
      'Renovar sem editar',
      true,
    );

    // != null
    if (res) {
      this.editProduct();
    } else if (res != null) {
      await this.inventoryService.renewProduct(this.productId);
      this.toastService.makeToast('Anúncio renovado');
      this.start();
    }
  }

  private getStatusText() {
    if (this.waiting_adjustment) return 'Requer ajustes';
    if (this.waiting_publication) return 'Em análise';
    if (this.expired) return 'Expirado';
    if (this.sold) return 'Vendido';
    if (this.reserved || this.selling) return 'Reservado';

    if (this.unavailable) return 'Indisponível';

    return null;
  }

  async openGallery() {
    const pictures = this.product.clothes.images.map((img) => img.lg);

    const index = this.swiperInstance.activeIndex;

    this.matDialog.open(TkGalleryComponent, {
      data: { imageUrls: pictures, startIndex: index },
      panelClass: 'dialog-gallery',
    });

    this.firebaseService.log('PRODUCT_ABRIU_GALERIA');
  }

  async infoWaitingPublication() {
    this.alertService.showAlert(
      'Anúncio em análise',
      'Este anúncio está sendo analisado pelo Trokaí e deve ser publicado em breve.',
    );
  }

  async infoExpired() {
    const res = await this.alertService.askQuestion(
      'Anúncio expirado',
      'Deseja renovar este anúncio?',
      'Renovar',
      'Agora não',
    );
    if (res) this.renewProduct();
  }

  async modalAdjusts() {
    const modal = await this.modalCtrl.create({
      component: RequiredAdjustsComponent,
      cssClass: 'modal-95',
      componentProps: {
        itemreview: this.adjusts,
        adjusts: this.product.clothes.adjusts,
        adjustsNote: this.product.clothes.adjustsNote,
      },
    });

    modal.present();

    const ret = await modal.onDidDismiss();

    if (ret.data && ret.data.editProduct) this.editProduct();
  }

  ngOnDestroy(): void {

    if (this.reservesSub) this.reservesSub.unsubscribe();
  }
}
