import {
  BasicModel,
  Brand,
  CategoryModel,
  Clothes,
  GlobalParams,
  ItemsMap,
  SellerFees,
  UploadPictureItem,
} from '@trokai/shared-core';
import { ProductService } from '@trokai/shared-data-access';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { ErrorStateMatcher, MatOptionModule } from '@angular/material/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { AlertService } from '../../alert/alert.service';
import { canSaveForm } from '../../forms';
import { CostPipe } from '../../pipes/cost.pipe';
import { TkAutocompleteComponent } from '../../media/autocomplete/tk-autocomplete.component';
import { TkFeesCalculatorComponent } from '../../billing/fees-calculator/tk-fees-calculator.component';
import { TkFormImagesComponent } from '../form-images/tk-form-images.component';

@Component({
  selector: 'tk-product-register-form',
  templateUrl: './tk-product-register-form.component.html',
  styleUrls: ['./tk-product-register-form.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TkFormImagesComponent,
    TkAutocompleteComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    DecimalPipe,
    CurrencyPipe,
    CostPipe,
  ],
})
export class TkProductRegisterFormComponent implements OnInit, OnChanges {
  @Input() itemsMap!: ItemsMap;
  @Input() params!: GlobalParams;
  @Input() brands: BasicModel<string>[] = [];
  /** Existing item (edit/duplicate) used to prefill the form. */
  @Input() product: Clothes | null = null;
  @Input() initialImages: UploadPictureItem[] | null = null;
  @Input() duplicating = false;
  @Input() editingId: string | null = null;
  @Input() waitingAdjustment = false;
  @Input() adjusts: string[] = [];
  @Input() adjustsNote = '';
  /** Shell sets true while uploading; disables the form. */
  @Input() loading = false;

  @Output() submitted = new EventEmitter<{
    clothes: Clothes;
    images: UploadPictureItem[];
  }>();
  @Output() helpRequested = new EventEmitter<void>();

  private productService = inject(ProductService);
  private alertService = inject(AlertService);
  private dialog = inject(MatDialog);

  categories: any[] | null = null;
  pieces: any[] | null = null;
  ages: any[] | null = null;
  sizes: any[] | null = null;
  conditions: any[] | null = null;
  genders: any[] | null = null;

  weightsList = [0.3, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  weightsStrings = [
    'Até 300 g',
    'Até 500 g',
    'Até 1 kg',
    'Até 1,5 kg',
    'Até 2 kg',
    'Até 3 kg',
    'Até 4 kg',
    'Até 5 kg',
    'Até 6 kg',
    'Até 7 kg',
    'Até 8 kg',
    'Até 9 kg',
    'Até 10 kg',
  ];

  form!: FormGroup;

  sellerFees!: SellerFees;
  sellerProfit = 0;

  images: UploadPictureItem[] = [];

  sizeCtrl = new FormControl(null, Validators.required);

  firstCost: number | null = null;
  currentCost: number | null = null;

  firstCostFormatted: number | null = null; // firstCost / 100
  currentCostFormatted: number | null = null; // currentCost / 100

  costErrorMin = false;
  costErrorMax = false;
  costErrorOffer = false;

  titlePattern = /^[a-zA-ZÀ-ÿ0-9][a-zA-ZÀ-ÿ0-9\s.,&()/-]{1,58}[a-zA-ZÀ-ÿ0-9)]$/;
  titleError: string | null = null;

  private listsMounted = false;
  private prefilled = false;

  readonly costRangeErrorMatcher: ErrorStateMatcher = {
    isErrorState: () =>
      this.costErrorMax || this.costErrorMin || this.costErrorOffer,
  };

  get canSave(): boolean {
    return canSaveForm(this.form, !!this.editingId);
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      category: new FormControl(null, Validators.required),
      age: new FormControl(null, Validators.required),
      piece: new FormControl(null, Validators.required),
      gender: new FormControl(null, Validators.required),
      brand: new FormControl(null),
      condition: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required),
      title: new FormControl(
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(64),
          Validators.pattern(this.titlePattern),
        ]),
      ),
      cost: new FormControl(null),
      weight: new FormControl(null, Validators.required),
      sell: new FormControl(null),
      declaredValue: new FormControl(null),
    });

    this.tryMountLists();
    this.tryPrefill();
  }

  ngOnChanges(): void {
    this.tryMountLists();
    this.tryPrefill();

    if (this.form) {
      if (this.loading && this.form.enabled) this.form.disable();
      else if (!this.loading && this.form.disabled) this.form.enable();
    }
  }

  private tryMountLists() {
    if (this.listsMounted || !this.itemsMap) return;
    this.listsMounted = true;

    this.categories = this.itemsMap.category
      .slice()
      .sort((a, b) => (a.value > b.value ? 1 : -1));

    this.ages = this.itemsMap.age
      .slice()
      .sort((a, b) => (a.value > b.value ? 1 : -1));

    this.conditions = this.itemsMap.condition
      .slice()
      .sort((a, b) => (a.value > b.value ? 1 : -1));

    this.genders = this.itemsMap.gender
      .slice()
      .sort((a, b) => (a.value > b.value ? 1 : -1));
  }

  private tryPrefill() {
    if (this.prefilled || !this.form || !this.itemsMap || !this.product) return;
    this.prefilled = true;

    const clothes = this.product;

    this.form.get('title')!.setValue(clothes.title);
    this.form.get('description')!.setValue(clothes.description);
    this.form.get('sell')!.setValue(clothes.sell);
    this.form.get('declaredValue')!.setValue(clothes.declaredValue);
    this.form.get('weight')!.setValue(clothes.weight);

    if (clothes.cost && !clothes.firstCost) {
      this.firstCost = clothes.cost;
      this.firstCostFormatted = clothes.cost / 100;
    }

    if (clothes.cost && clothes.firstCost) {
      this.firstCost = clothes.firstCost;
      this.firstCostFormatted = clothes.firstCost / 100;

      this.currentCost = clothes.cost;
      this.currentCostFormatted = clothes.cost / 100;
    }

    // remove promocao
    if (this.duplicating) {
      this.currentCost = clothes.firstCost ?? clothes.cost;
      this.currentCostFormatted = this.currentCost / 100;
      this.firstCost = null;
    }

    this.form.get('cost')!.setValue(this.currentCostFormatted);
    this.changeCost();

    const cond = this.itemsMap.condition.find(
      (c) => c._id === clothes.condition,
    );
    this.form.get('condition')!.setValue(cond);

    const gend = this.itemsMap.gender.find((c) => c._id === clothes.gender);
    this.form.get('gender')!.setValue(gend);

    const cat = this.itemsMap.category.find((c) => c._id === clothes.category);
    this.form.get('category')!.setValue(cat);
    this.selectedCategory(cat!);

    const age = this.itemsMap.age.find((a) => a._id === clothes.age);
    this.form.get('age')!.setValue(age);
    this.selectedAge(age!);

    const piece = cat?.pieces.find((p) => p._id === clothes.piece);
    this.form.get('piece')!.setValue(piece);
    this.selectedPiece(piece!);

    if (clothes.size != null && cat?.sizes?.length) {
      const size = cat.sizes[clothes.age].find((s) => s._id === clothes.size);
      this.form.get('size')?.setValue(size);
    }

    if (clothes.brand != null) {
      this.form
        .get('brand')!
        .setValue(new BasicModel(clothes.brand.slug, clothes.brand.name));
    }
  }

  outputImages(images: UploadPictureItem[]) {
    this.images = images;
  }

  onHelpPictures() {
    this.helpRequested.emit();
  }

  async selectedCategory(category: CategoryModel) {
    if (category == null) {
      this.pieces = null;
      this.sizes = null;
      this.form.get('piece')!.setValue(null);
      this.form.get('size')?.setValue(null);
    } else {
      this.pieces = category.pieces
        .slice()
        .sort((a, b) => (a.value > b.value ? 1 : -1));
      this.catAge();
    }
  }

  async selectedPiece(piece: BasicModel) {
    if (piece == null) {
      this.sizes = null;
      this.form.get('size')?.setValue(null);
      return;
    }
    this.catAge();
  }

  async selectedAge(age: BasicModel) {
    if (age == null) {
      this.sizes = null;
      this.form.get('size')?.setValue(null);
      return;
    }
    this.catAge();
  }

  async catAge() {
    if (
      this.form.get('category')!.value == null ||
      this.form.get('age')!.value == null
    ) {
      this.sizes = null;
      if (this.form.contains('size')) this.form.removeControl('size');
    } else {
      const cat = this.itemsMap.category.find(
        (item) => item._id == this.form.get('category')!.value._id,
      );
      if (cat?.sizes && cat.sizes.length > 0) {
        this.sizes = cat.sizes[this.form.get('age')!.value._id]
          .slice()
          .sort((a, b) => (a.value > b.value ? 1 : -1));
        this.form.addControl('size', this.sizeCtrl);
      } else {
        if (this.form.contains('size')) this.form.removeControl('size');
      }
    }
  }

  checkTitle() {
    const base =
      this.form.get('title')!.errors && this.form.get('title')!.touched;

    if (!base) {
      this.titleError = null;
      return false;
    }

    this.titleError =
      'O título deve ter entre 3 e 60 caracteres, começar e terminar com letra ou número, e usar apenas letras, números, espaços e os símbolos: . , & ( ) / -';

    return true;
  }

  isCostValid() {
    if (!this.form) return false;

    // if no cost and no firstCost, error
    if (this.currentCost == null && !this.firstCost) return false;

    // if no cost and has firstCost, no error
    if (this.currentCost == null && this.firstCost) {
      this.costErrorMax = false;
      this.costErrorMin = false;
      this.costErrorOffer = false;
      return true;
    }

    // check errors
    this.costErrorMin = this.currentCost! < this.params.minProductCost;
    this.costErrorMax = this.currentCost! > this.params.maxProductCost;

    const offerOK =
      !this.firstCost ||
      (this.firstCost && this.currentCost == null) ||
      this.currentCost! <= this.firstCost;

    this.costErrorOffer = !offerOK;

    return !this.costErrorMin && !this.costErrorMax && offerOK;
  }

  async changeCost() {
    if (this.form.get('cost')!.value != null) {
      const str = this.form.get('cost')!.value.toString().replace(',', '.');

      if (str && str.length) {
        const num = +str;
        this.currentCost = +(num * 100).toFixed(2);
        this.currentCostFormatted = num;
      } else {
        this.currentCost = null;
        this.currentCostFormatted = null;
      }
    } else {
      this.currentCost = null;
      this.currentCostFormatted = null;
    }

    if (!this.isCostValid()) {
      this.sellerFees = undefined as any;
      this.sellerProfit = 0;
      return;
    }

    this.sellerFees = await this.productService.getSellerFees(
      (this.currentCost || this.firstCost)!,
    );

    if (this.sellerFees.declaredValueFee == null)
      this.form.get('declaredValue')!.setValue(null);

    this.calculateSellerProfit();
  }

  openCalculator() {
    this.dialog.open(TkFeesCalculatorComponent, {
      data: {
        sellerFees: this.sellerFees,
        productCost: this.currentCost || this.firstCost,
        declaredValue:
          !!this.form.get('declaredValue')!.value &&
          !!this.sellerFees?.declaredValueFee,
      },
    });
  }

  calculateSellerProfit() {
    if (!this.sellerFees) return;

    const declared = !!this.form.get('declaredValue')!.value;
    const cost = (this.currentCost || this.firstCost)!;

    this.sellerProfit = cost - cost * this.sellerFees.sellerPercentageFee;

    if (declared) this.sellerProfit -= this.sellerFees.declaredValueFee;
  }

  save() {
    if (!this.images || this.images.length < 2) {
      this.alertService.alert('Adicione ao menos duas fotos ao anúncio');
      return;
    }

    if (!this.form.valid || !this.isCostValid() || this.titleError) {
      this.alertService.formError();
      return;
    }

    const form = { ...this.form.value };

    const c: Clothes = new Clothes();

    if (this.editingId) c._id = this.editingId;

    // costs
    if (!this.currentCost) c.cost = undefined as any;
    else c.cost = this.currentCost;

    // if no cost, use firstCost
    if (!c.cost && this.firstCost) c.cost = this.firstCost;

    delete c.firstCost;

    c.age = form.age._id;
    c.category = form.category._id;
    c.condition = form.condition._id;

    c.declaredValue = form.declaredValue;
    c.description = form.description;
    c.gender = form.gender._id;
    c.piece = form.piece._id;
    c.sell = form.sell;
    c.title = form.title;
    c.weight = form.weight;

    if (form.brand) {
      if (typeof form.brand === 'string') c.brand = new Brand(form.brand);
      else c.brand = new Brand(form.brand.value, form.brand._id);
    } else if (this.editingId) {
      c.brand = Brand.markToRemove();
    }

    if (form.size) c.size = form.size._id;

    this.submitted.emit({ clothes: c, images: this.images });
  }
}
