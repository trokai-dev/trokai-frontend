import { CostPipe } from '@trokai/shared-ui';
import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Filters } from '@trokai/shared-core';
import { NgClass, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonIcon,
  IonTitle,
  IonContent,
  IonFooter,
  IonBadge,
  IonRippleEffect,
} from '@ionic/angular/standalone';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { addIcons } from 'ionicons';
import {
  chevronDown,
  chevronUp,
  close,
  helpCircleOutline,
} from 'ionicons/icons';
import { GlobalService } from 'src/app/services/global.service';
import { ToastService } from 'src/app/services/toast-service';
import { BasicModel, notNullOrEmpty } from '@trokai/shared-core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonIcon,
    IonTitle,
    IonBadge,
    IonRippleEffect,
    IonContent,
    IonFooter,
    MatRadioModule,
    MatSliderModule,
    MatButtonModule,
    FormsModule,
    NgClass,
    CostPipe,
    CurrencyPipe,
  ],
})
export class FilterComponent implements OnInit, OnDestroy, AfterViewInit {
  private modalCtrl = inject(ModalController);
  private toastService = inject(ToastService);
  private globalService = inject(GlobalService);

  itemsMap = null;
  sizes = [];
  pieces = [];

  @Input() filter = new Filters();

  sections = {
    condition: false,
    gender: false,
    category: false,
    size: false,
    cost: false,
    location: false,
  };

  category: any = {};

  itemsMapSub: Subscription;

  costRange = { lower: null, upper: null };
  maxCost = 21000;

  ngOnInit() {
    addIcons({ close, helpCircleOutline, chevronUp, chevronDown });
    this.itemsMapSub = this.globalService
      .itemsMap()
      .subscribe((items) => (this.itemsMap = items));
    this.resetLocalFilter();
  }

  ngAfterViewInit(): void {
    this.costRange.lower = this.filter.costLower ?? 0;
    this.costRange.upper = this.filter.costUpper ?? this.maxCost;
  }

  resetLocalFilter() {
    if (!this.filter.size) this.filter.size = [];
    if (!this.filter.piece) this.filter.piece = [];
    if (!this.filter.gender) this.filter.gender = [];
    if (!this.filter.condition) this.filter.condition = [];

    if (this.filter.category != null) {
      this.category = {
        ...this.itemsMap.category.find(
          (cat) => cat._id === this.filter.category,
        ),
      };
      if (this.category != null) this.mountPieces();

      if (this.filter.age != null) this.mountSizes(this.filter.age);
    }
  }

  mountSizes(ageSelected) {
    if (ageSelected !== this.filter.age) {
      this.filter.size = [];
      this.filter.age = ageSelected;
    }

    this.sizes = [];

    if (!this.category['sizes'] || this.category['sizes'].length === 0) return;

    const ageSizes = this.category['sizes'][ageSelected];
    ageSizes.forEach((size) =>
      this.sizes.push({ sizeId: size._id, sizeValue: size.value }),
    );

    this.sizes = [...this.category['sizes'][ageSelected]];
  }

  mountPieces() {
    if (this.category)
      this.pieces = [...this.category['pieces']].sort((a, b) =>
        a.value > b.value ? 1 : -1,
      );
    else this.pieces = [];
  }

  filtersOn() {
    return this.filter.enabled();
  }

  clear() {
    this.filter = new Filters({ status: this.filter.status });
    this.toastService.makeToast('Filtros removidos');
    this.close(true);
  }

  close(filtersChanged = false) {
    this.modalCtrl.dismiss({
      filters: this.filter,
      filtersChanged: filtersChanged,
    });
  }

  openSection(section) {
    this.sections[section] = !this.sections[section];
  }

  changeCategory(catId) {
    if (catId == null) return;
    const cat = this.itemsMap.category.find((item) => item._id === catId);
    this.selectCategory(cat);
  }

  selectCategory(cat) {
    if (this.category && this.category['_id'] == cat._id) {
      this.category = null;
      this.filter.category = null;
      this.filter.age = null;
    } else {
      this.category = { ...cat };
      this.filter.category = cat._id;
    }

    this.sizes = [];
    this.filter.size = [];
    this.filter.piece = [];
    this.filter.gender = [];
    this.filter.condition = [];

    if (this.filter.age != null) this.mountSizes(this.filter.age);

    this.mountPieces();
  }

  helpSize(event) {
    event.stopPropagation();

    if (this.filter.category == null) {
      this.toastService.makeToast(
        'Selecione uma categoria para ver os tamanhos.',
      );
    } else if (
      this.filter.category !== null &&
      (!this.category['sizes'] || this.category['sizes'].length === 0)
    ) {
      this.toastService.makeToast(
        'Categoria ' + this.category['value'] + ' não possui tamanhos',
      );
    } else {
      this.toastService.makeToast(
        'Selecione a faixa etária para ver os tamanhos',
      );
    }
  }

  changeCost() {
    this.filter.costLower =
      this.costRange.lower > 0 ? this.costRange.lower : null;
    this.filter.costUpper =
      this.costRange.upper < this.maxCost ? this.costRange.upper : null;
  }

  applyFilters() {
    this.close(true);
    this.toastService.makeToast('Filtros aplicados');
  }

  select(property: string, item?: BasicModel) {
    if (Filters.booleanFilters.includes(property)) {
      if (!this.filter[property]) this.filter[property] = true;
      else delete this.filter[property];
      return;
    }

    if (Filters.singleChoiceFilters.includes(property))
      this.selectSingle(property, item);
    else this.selectMultiple(property, item);
  }

  selectMultiple(property: string, item: BasicModel) {
    const index = this.filter[property].findIndex(
      (el) => el.toString() === item._id.toString(),
    );

    if (index >= 0) {
      this.filter[property].splice(index, 1);
    } else {
      const els = [...this.filter[property]];
      els.push(item._id);
      this.filter[property] = els;
    }
  }

  // special, gender, condition
  selectSingle(property: string, item: BasicModel) {
    if (this.filter[property] == null) this.filter[property] = item._id;
    else if (this.filter[property] === item._id) this.filter[property] = null;
    else this.filter[property] = item._id;
  }

  private multipleSelected(property: string, item: BasicModel) {
    if (!notNullOrEmpty(this.filter[property])) return false;

    if (Array.isArray(this.filter[property])) {
      return this.filter[property].find((el) => el === item._id) != null;
    } else {
      return this.filter[property] === item._id;
    }
  }
  selected(property: string, item: BasicModel) {
    if (Filters.singleChoiceFilters.includes(property))
      return this.filter[property] === item._id;
    else return this.multipleSelected(property, item);
  }

  ngOnDestroy(): void {
    if (this.itemsMapSub) this.itemsMapSub.unsubscribe();
  }
}
