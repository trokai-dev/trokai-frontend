import { User } from '@trokai/shared-core';
import { Clothes, ClothesStatus } from '@trokai/shared-core';
import { InventoryService } from './../wardrobe/inventory.service';
import { AlertService, CostPipe } from '@trokai/shared-ui';
import { AuthService } from 'src/app/auth/auth.service';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';

import { environment } from 'src/environments/environment';
import { GlobalService } from '../services/global.service';
import { ClothesPayment, ProductService } from '@trokai/shared-data-access';
import { ItemsMap } from '@trokai/shared-core';
import { StatusPillComponent, ItemNamePipe } from '@trokai/shared-ui';
import { Subscription } from 'rxjs';
import { CompletingInformationService } from '@trokai/shared-data-access';
import { Basket, BuyingService } from '@trokai/shared-data-access';
import { ProductsHorizontalListComponent } from '../modules/products-list/products-horizontal-list/products-horizontal-list.component';
import { ProductQuestionsComponent } from './product-questions/product-questions.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TkZipcodeShippingFeeComponent as ZipcodeShippingFeeComponent } from '@trokai/shared-ui';
import { MatButtonModule } from '@angular/material/button';
import { TitleCasePipe, CurrencyPipe } from '@angular/common';
import { TrokaiGtmService } from '../services/trokai-gtm.service';
import { SearchService } from '../search/search.service';
import { Filters, GlobalParams } from '@trokai/shared-core';
import { PreloadService } from '../services/preload.service';
import { TkSellerHeaderComponent } from '@trokai/shared-ui';
import { TkReviewStarsComponent } from '@trokai/shared-ui';
import { DialogService } from '../services/dialog.service';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TkGalleryComponent, TkProductImageComponent } from '@trokai/shared-ui';
import { TkProductOwnerButtonsComponent, TkReserveTimeComponent } from '@trokai/shared-features';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatButtonModule,
    ZipcodeShippingFeeComponent,
    MatTooltipModule,
    RouterLink,
    ProductQuestionsComponent,
    ProductsHorizontalListComponent,
    TitleCasePipe,
    CurrencyPipe,
    CostPipe,
    TkSellerHeaderComponent,
    TkReviewStarsComponent,
    TkReserveTimeComponent,
    TkProductImageComponent,
    StatusPillComponent,
    ItemNamePipe,
    TkProductOwnerButtonsComponent,
  ],
})
export class ProductComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);
  private authService = inject(AuthService);
  private inventoryService = inject(InventoryService);
  private alert = inject(AlertService);
  private productService = inject(ProductService);
  private globalService = inject(GlobalService);
  private router = inject(Router);
  private buyingService = inject(BuyingService);
  private trokaiGtmService = inject(TrokaiGtmService);
  private preloadService = inject(PreloadService);
  private matDialog = inject(MatDialog);
  private completingInformation = inject(CompletingInformationService);
  private dialogService = inject(DialogService);
  private platformId = inject(PLATFORM_ID);

  productId: string | undefined;
  product?: Clothes;
  payment?: ClothesPayment;

  owner!: User;
  url = '';

  activeImage = 0;

  buySelected = false;

  itemsMap: ItemsMap | undefined;

  myProduct = false;

  // cart
  product_in_basket = false;
  wardrobe_basket = false;
  wardrobe_reserved = false;

  baskets: Basket[] = [];

  expiration: {
    text: string;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
  } | null = null;
  params: GlobalParams | null = null;
  showRenew = false;

  user!: User;
  otherClothes: Clothes[] = [];

  routerSub!: Subscription;

  statusText?: string;

  isInReserves: boolean | null = null;
  reservesSub!: Subscription;

  openReviews(store: User) {
    if (!store?.seller?.health?.reviewsAmount) return;
    this.dialogService.openUserReviews(store);
  }

  async ngOnInit() {
    this.routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) this.start();
    });

    this.globalService.itemsMap$.subscribe((res) => {
      if (!res) return;
      this.itemsMap = res;
    });

    this.authService.user$.subscribe((u) => {
      if (!u) return;
      this.user = u;
      this.mountStatus();
    });

    this.globalService.params$.subscribe((params) => {
      this.params = params;
      this.mountExpiration();
    });

    this.url = environment.imageURL;

    await this.start();

    this.buyingService.baskets$.subscribe((baskets) => {
      this.baskets = baskets;
      this.processBaskets();
    });

    this.reservesSub = this.buyingService.reserves$.subscribe((clothes) => {
      if (!clothes) return;

      const isReserved = !!clothes.find((el) => el._id === this.productId);

      if (this.isInReserves != null && this.isInReserves !== isReserved)
        this.start();

      this.isInReserves = isReserved;
    });
  }

  async start() {
    try {
      this.product = undefined;

      const slug = this.route.snapshot.paramMap.get('product_title_id');
      if (!slug) throw new Error('Produto não encontrado');
      const param = slug.split('-');

      this.productId = param[param.length - 1];

      const data = await this.productService.fetchCompleteProduct(
        this.productId,
      );

      this.product = new Clothes(data.clothes);
      this.payment = data.payment;

      const mainPicUrl = this.product.images?.[0]?.md;
      if (mainPicUrl) this.preloadService.preloadImage(mainPicUrl);
      this.globalService.setTitle(this.product.title);

      if (!this.product.owner) throw new Error('Produto sem dono');
      this.owner = await this.searchService.getUserInfo(this.product.owner);

      this.mountStatus();

      if (
        !this.myProduct &&
        (this.product.expired ||
          this.product.paused ||
          this.product.waitingAdjustment ||
          this.product.waitingPublication)
      )
        throw new Error('Status not allowed');

      this.processBaskets();

      if (!this.myProduct && this.user)
        setTimeout(() => {
          if (this.productId)
            this.productService.visitItem(this.productId).subscribe();
        }, 2000);

      this.trokaiGtmService.viewProductEvent(this.product);

      const pieceString = this.productService.getPieceName(
        this.product.piece,
        this.product.category,
      );
      const genderString = this.productService.getGenderName(
        this.product.gender,
      );
      const conditionString = this.productService.getConditionName(
        this.product.condition,
      );
      const sizeString = this.productService.getSizeName(
        this.product.size,
        this.product.category,
        this.product.age,
      );
      let description = `Comprar ${pieceString} ${genderString} ${conditionString} Tamanho ${sizeString} no Trokaí. `;
      description += `${this.product.title}. ${this.product.description.replace(
        /(\r\n|\n|\r)/gm,
        '. ',
      )}`;

      this.globalService.setMetaDescription(description);

      // og:image — use the best quality image for social shares
      const productSlug = this.route.snapshot.paramMap.get('product_title_id');
      const productUrl = `${environment.domain}/items/${productSlug}`;
      const ogImageUrl =
        this.product.images?.[0]?.lg ?? this.product.images?.[0]?.md;
      if (ogImageUrl) this.globalService.setOgImage(ogImageUrl);
      this.globalService.setOgUrl(productUrl);

      // JSON-LD Product schema for Google Shopping / rich results
      const isAvailable = this.product.published;
      const price = this.payment?.pix?.buyerCost ?? this.product.cost;
      this.globalService.setJsonLd({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: this.product.title,
        description: this.product.description,
        image: (this.product.images ?? []).map((img) => img.lg).filter(Boolean),
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'BRL',
          price,
          itemCondition: 'https://schema.org/UsedCondition',
          availability: isAvailable
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      });

      await this.getSuggestionClothes();
    } catch {
      this.alert.alert('Produto não encontrado!');
      this.router.navigateByUrl('/');
    }
  }

  async getSuggestionClothes() {
    if (!this.product) return;

    const exclude_suggestions: string[] = []; // exclude the current product
    if (this.product._id) exclude_suggestions.push(this.product._id);

    const baskets = this.buyingService.getBasketFromOwner(this.owner._id);

    if (baskets)
      // exclude the products in the basket of the owner
      exclude_suggestions.push(
        ...baskets.products
          .map((p) => p._id)
          .filter((id): id is string => !!id),
      );

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

  openGallery(index: number) {
    const imageUrls = (this.product?.images ?? []).map((img) => img.lg);

    this.matDialog.open(TkGalleryComponent, {
      data: { imageUrls, startIndex: index },
      panelClass: 'dialog-gallery',
    });
  }

  startRadios() {
    if (this.product?.sell) {
      this.buySelected = true;
      return;
    }
  }

  getOwnerAvatar() {
    if (this.owner.avatar && this.owner.avatar != '') {
      return (
        environment.imageURL + this.owner._id + '/avatar/' + this.owner.avatar
      );
    } else {
      return environment.defaultAvatar1;
    }
  }

  mountStatus() {
    if (!this.product) return;

    this.myProduct =
      this.user && this.owner && this.user._id === this.owner._id;

    this.mountExpiration();
  }

  async mountExpiration() {
    if (!this.product || !this.params) return;

    if (this.product.expired) this.showRenew = true;
    if (!this.product.published || !this.product.updatedAt) return;

    this.expiration = this.globalService.mountExpiration(
      this.product.updatedAt,
      this.params.daysToExpireClothes,
    );
    this.showRenew = !!this.expiration && this.expiration.days <= 5;
  }

  async editProduct() {
    if (!this.myProduct) return;
    this.router.navigateByUrl(`/sell/${this.productId}`);
  }

  async duplicateProduct() {
    if (!this.myProduct) return;
    this.router.navigateByUrl(`/sell/duplicate/${this.productId}`);
  }

  async clickBuy() {
    if (!this.product) return;
    this.buyingService.addProduct(this.owner, this.product);
    // this.router.navigateByUrl(`/buying/carts?from=${this.owner._id}`);
  }

  async openCheckout() {
    await this.completingInformation.tryStartPurchase(this.owner._id);
  }

  removeFromBasket() {
    if (!this.product) return;
    this.buyingService.removeProduct(this.product);
  }

  async deleteProduct() {
    if (!this.myProduct || !this.product) return;

    const answer = await this.alert.question(
      'Essa ação não pode ser desfeita.',
      'Excluir anúncio?',
      'Excluir',
      'Cancelar',
    );
    if (!answer) return;

    try {
      await this.inventoryService.deleteItem(this.product);
      this.alert.alert('Anúncio excluído!');
      this.router.navigateByUrl('/users/' + this.user.seller?.nickname);
    } catch {
      /* intentional */
    }
  }

  async renewProduct() {
    try {
      const res = await this.alert.question(
        'É recomendado melhorar o anúncio antes de renová-lo, deseja fazer isso?',
        'Renovar anúncio',
        'Melhorar primeiro',
        'Renovar sem editar',
      );

      if (res) {
        this.editProduct();
      } else if (res != null) {
        if (this.productId)
          await this.inventoryService.renewProduct(this.productId);
        this.start();
      }
    } catch {
      /* intentional */
    }
  }

  processBaskets() {
    if (!this.baskets || !this.owner) {
      this.product_in_basket = false;
      this.wardrobe_basket = false;
      this.wardrobe_reserved = false;
      return;
    }

    const basket = this.baskets.find((b) => b.owner._id === this.owner._id);

    if (basket) {
      // check if there is basket for the wardrobe
      this.wardrobe_basket = true;
      // check if this product is in basket
      this.product_in_basket = basket.products.some(
        (product) => product._id === this.product?._id,
      );
      this.wardrobe_reserved = basket.reserved;
    } else {
      this.product_in_basket = false;
      this.wardrobe_basket = false;
      this.wardrobe_reserved = false;
    }
  }

  async deactivateProduct() {
    if (!this.myProduct || !this.productId) return;
    await this.inventoryService.deactivateProduct(this.productId);
    this.alert.alert('Anúncio pausado');
    this.start();
  }

  async activateProduct() {
    if (!this.myProduct || !this.productId) return;
    await this.inventoryService.activateProduct(this.productId);
    this.alert.alert('Anúncio ativado');
    this.start();
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.reservesSub) this.reservesSub.unsubscribe();
    this.globalService.clearJsonLd();
  }
}
