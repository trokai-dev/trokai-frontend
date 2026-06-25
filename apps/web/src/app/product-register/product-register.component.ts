import {
  BasicModel,
  Clothes,
  ClothesStatus,
  FeedbackService,
  GlobalParams,
  ItemsMap,
  UploadPictureItem,
  User,
} from '@trokai/shared-core';
import { CompletingInformationService } from '@trokai/shared-data-access';
import { ProductService } from '@trokai/shared-data-access';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TkProductRegisterFormComponent } from '@trokai/shared-ui';
import { AuthService } from './../auth/auth.service';
import { InventoryService } from './../wardrobe/inventory.service';
import { GlobalService } from '../services/global.service';
import { Component, OnInit, inject } from '@angular/core';
import { PicturesHelpDialogComponent } from './pictures-help-dialog/pictures-help-dialog.component';

@Component({
  selector: 'app-product-register',
  templateUrl: './product-register.component.html',
  styleUrls: ['./product-register.component.scss'],
  standalone: true,
  imports: [TkProductRegisterFormComponent],
})
export class ProductRegisterComponent implements OnInit {
  private globalService = inject(GlobalService);
  private completingInformationService = inject(CompletingInformationService);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private inventoryService = inject(InventoryService);
  private feedback = inject(FeedbackService);

  itemsMap!: ItemsMap;
  params!: GlobalParams;
  brands: BasicModel<string>[] = [];
  user!: User;

  product: Clothes | null = null;
  initialImages: UploadPictureItem[] | null = null;
  duplicating = false;
  editingId: string | null = null;
  waitingAdjustment = false;
  adjusts: string[] = [];
  adjustsNote = '';
  loading = false;

  ngOnInit(): void {
    this.globalService.setTitle('Anunciar');
    this.duplicating = this.route.snapshot.url[0]?.path === 'duplicate';

    this.globalService.itemsMap$.subscribe((itemsMap) => {
      if (!itemsMap) return;
      this.itemsMap = itemsMap;
      this.checkLoadedToEdit();
    });

    this.globalService.params$.subscribe((params) => {
      if (!params) return;
      this.params = params;
      this.checkLoadedToEdit();
    });

    this.globalService.brands$.subscribe(() => {
      this.brands =
        this.globalService
          .getBrandsValue()
          ?.map((b) => new BasicModel<string>(b.slug, b.name)) ?? [];
    });

    this.authService.user$.subscribe((u) => {
      if (u) this.user = u;
    });
  }

  async checkLoadedToEdit() {
    try {
      if (!this.params || !this.itemsMap) return;

      this.editingId = this.route.snapshot.params['product_id'];

      if (this.editingId) {
        if (await this.completingInformationService.canRegisterProduct())
          this.loadForEdit();
      } else {
        this.initialImages = [];
        await this.completingInformationService.canRegisterProduct();
      }
    } catch {
      /* intentional */
    }
  }

  async loadForEdit() {
    try {
      if (!this.editingId) return;
      const res = await this.productService.fetchProduct(this.editingId);
      const clothes = res.clothes;

      if (clothes.owner !== this.user._id) {
        this.router.navigateByUrl('/');
        return;
      }

      if (this.duplicating) {
        // Pre-fetch images as blobs so the form shows them as new local pictures.
        await this.inventoryService.startDuplicate(clothes);
      } else {
        this.inventoryService.startEditing(clothes);
      }

      this.initialImages = [...this.inventoryService.pendingPictures];

      this.waitingAdjustment =
        clothes.status === ClothesStatus.WAITING_ADJUSTMENT;

      if (this.waitingAdjustment) await this.loadReview(clothes);

      this.product = clothes;
    } catch {
      /* intentional */
    }
  }

  async loadReview(clothes: Clothes) {
    try {
      const itemReview = (await this.inventoryService.getItemReview()) as {
        _id: number;
        info: string;
      }[];
      this.adjusts = clothes.adjusts
        .map((el) => itemReview.find((ir) => ir._id == el)?.info)
        .filter((info): info is string => !!info);
      this.adjustsNote = clothes.adjustsNote;
    } catch {
      /* intentional */
    }
  }

  onHelpPictures() {
    this.dialog.open(PicturesHelpDialogComponent, {
      panelClass: 'dialog-product-tips',
    });
  }

  async onSubmitted({
    clothes,
    images,
  }: {
    clothes: Clothes;
    images: UploadPictureItem[];
  }) {
    this.loading = true;
    this.inventoryService.pendingPictures = images;
    this.inventoryService.item = clothes;

    try {
      if (this.duplicating) {
        this.inventoryService.item.copyOf = clothes._id;
        delete this.inventoryService.item._id;
        await this.inventoryService.duplicate();
      } else {
        await this.inventoryService.upload();
      }

      this.router.navigateByUrl(`/users/${this.user.seller?.nickname}`, {
        replaceUrl: true,
      });

      this.feedback.success('Anúncio enviado!');
    } catch {
      this.loading = false;
    }
  }
}
