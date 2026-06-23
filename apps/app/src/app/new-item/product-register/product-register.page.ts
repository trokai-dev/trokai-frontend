import {
  BasicModel,
  Clothes,
  GlobalParams,
  ItemsMap,
  UploadPictureItem,
  User,
} from '@trokai/shared-core';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '@trokai/shared-data-access';
import { Network } from '@capacitor/network';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { IDeactivatableComponent } from 'src/app/shared/classes/deactivatable-component.interface';
import { InventoryService } from '../../services/inventory.service';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import {
  IonRouterOutlet,
  LoadingController,
  IonHeader,
  IonToolbar,
  IonContent,
  IonTitle,
} from '@ionic/angular/standalone';
import {
  AlertService,
  TkProductRegisterFormComponent,
} from '@trokai/shared-ui';
import { FirebaseService } from 'src/app/services/firebase.service';
import { GlobalService } from 'src/app/services/global.service';
import { ToastService } from 'src/app/services/toast-service';

@Component({
  selector: 'app-product-register',
  templateUrl: './product-register.page.html',
  styleUrls: ['./product-register.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonTitle,
    BackButtonComponent,
    TkProductRegisterFormComponent,
  ],
})
export class ProductRegisterPage implements OnInit, IDeactivatableComponent {
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private firebaseService = inject(FirebaseService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private globalService = inject(GlobalService);
  private alertService = inject(AlertService);
  private routerOutlet = inject(IonRouterOutlet);
  private authService = inject(AuthService);
  private loadingCtrl = inject(LoadingController);

  itemsMap: ItemsMap;
  params: GlobalParams;
  brands: BasicModel<string>[] = [];
  user: User;

  product: Clothes | null = null;
  initialImages: UploadPictureItem[] | null = null;
  duplicating = false;
  editingId: string | null = null;
  loading = false;

  mayLeave = false;

  async ngOnInit() {
    this.routerOutlet.swipeGesture = false;
    this.itemsMap = this.globalService.getItemsMapValue();
    this.params = this.globalService.getParamsValue();
    this.brands = this.globalService
      .getBrandsValue()
      .map((b) => new BasicModel<string>(b.slug, b.name));

    this.editingId = this.route.snapshot.paramMap.get('product_id');
    this.duplicating =
      this.route.snapshot.queryParamMap.get('duplicate') === 'true';

    if (this.editingId) await this.loadForEdit();
    else this.initialImages = [];

    this.authService.user.subscribe((user) => (this.user = user));
    this.firebaseService.log('ROUPA_ABRIU_CADASTRO');
  }

  // Always fetch the product when editing/duplicating instead of relying on
  // in-memory inventory state set by the caller.
  async loadForEdit() {
    try {
      if (!this.editingId) return;
      const { clothes } = await this.productService.fetchProduct(
        this.editingId,
      );

      if (this.duplicating) await this.inventoryService.startDuplicate(clothes);
      else this.inventoryService.startEditing(clothes);

      this.product = new Clothes({ ...this.inventoryService.item });
      this.initialImages = [...this.inventoryService.pendingPictures];
    } catch {
      this.router.navigateByUrl('/main/profile/inventory', {
        replaceUrl: true,
      });
    }
  }

  async onSubmitted({
    clothes,
    images,
  }: {
    clothes: Clothes;
    images: UploadPictureItem[];
  }) {
    const loading = await this.loadingCtrl.create({ message: 'Enviando...' });
    await loading.present();
    this.loading = true;

    try {
      const connection = await Network.getStatus();
      if (!connection.connected) {
        this.toastService.makeToastInternet(false);
        return;
      }

      if (this.product?.copyOf) clothes.copyOf = this.product.copyOf;
      this.inventoryService.pendingPictures = images;
      this.inventoryService.item = clothes;

      if (this.duplicating) await this.inventoryService.duplicate();
      else await this.inventoryService.upload();

      this.mayLeave = true;

      this.router.navigateByUrl('/main/profile/inventory', {
        replaceUrl: true,
      });

      this.toastService.makeToast('Anúncio enviado');
      this.firebaseService.log('ROUPA_CADASTRADA');
    } finally {
      this.loading = false;
      loading.dismiss();
    }
  }

  ionViewDidLeave() {
    this.routerOutlet.swipeGesture = true;
    this.inventoryService.resetItem();
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.mayLeave) return true;
    return this.alertService.askQuestion(
      'Descartar alterações?',
      'Deseja sair e descartar as alterações?',
    );
  }
}
