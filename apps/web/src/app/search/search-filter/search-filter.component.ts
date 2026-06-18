import { BasicModel, Filters, notNullOrEmpty } from '@trokai/shared-core';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { ItemsMap, CategoryModel } from '@trokai/shared-core';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgClass, TitleCasePipe } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    MatCheckboxModule,
    MatRadioModule,
    NgClass,
    MatInputModule,
    TitleCasePipe,
    MatIconModule,
    MatButtonModule,
  ],
})
export class SearchFilterComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  itemsMap: ItemsMap | null = null;
  sizes: any = [];
  pieces: any = [];

  @Input() filter = new Filters();
  @Input() enableSorting = true;
  @Input() dismissable = false;
  @Input() hideTitle = false;
  @Output() filtersChange = new EventEmitter<Filters>();
  @Output() dismiss = new EventEmitter<void>();

  sections: Record<string, boolean> = {
    condition: false,
    gender: false,
    category: false,
    size: false,
    cost: false,
    promotional: false,
  };

  category: CategoryModel | undefined;
  maxCost = 21000;
  minCost = 0;
  costRange: { lower: number | null; upper: number | null } = {
    lower: null,
    upper: null,
  };

  itemsMapSub!: Subscription;

  private globalService = inject(GlobalService);
  private ngZone = inject(NgZone);

  ngOnInit() {
    this.itemsMapSub = this.globalService.itemsMap.subscribe((itemsMap) => {
      if (itemsMap) {
        this.itemsMap = itemsMap;
        this.resetLocalFilter();
      }
    });
  }

  ngAfterViewInit(): void {
    // Run outside zone — this setTimeout creates a Zone.js macrotask that
    // keeps the app unstable until it fires.
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          if (this.filter.costLower)
            this.costRange.lower = this.filter.costLower / 100;
          if (this.filter.costUpper)
            this.costRange.upper = this.filter.costUpper / 100;

          this.openSections();
        });
      });
    });
  }

  openSections() {
    for (const key of Object.keys(this.sections)) {
      switch (key) {
        case 'size': {
          if (notNullOrEmpty(this.filter[key]) || this.filter.age != null)
            this.sections[key] = true;
          break;
        }

        case 'piece': {
          if (notNullOrEmpty(this.filter[key])) this.sections[key] = true;
          break;
        }

        case 'cost': {
          if (this.filter.costLower != null || this.filter.costUpper != null)
            this.sections[key] = true;
          break;
        }

        default: {
          if (notNullOrEmpty(this.filter[key])) this.sections[key] = true;
        }
      }
    }
  }

  mountSizes(ageSelected: number) {
    if (ageSelected !== this.filter.age) {
      this.filter.size = [];
      this.filter.age = ageSelected;
    }

    this.sizes = [];

    if (!this.category?.['sizes'] || this.category['sizes'].length === 0)
      return;

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
    this.filter = new Filters();
    this.filtersChanged();
    this.close();
  }

  changeCategory(catId: number) {
    if (catId == null) return;
    const cat = this.itemsMap?.category.find((item) => item._id === catId);

    if (cat) this.selectCategory(catId);
  }

  selectAge() {
    this.filter.size = [];
    this.filtersChanged();
    if (this.filter.age != null) this.mountSizes(this.filter.age);
  }

  selectCategory(catId: number) {
    const cat = this.itemsMap?.category.find((c) => c._id === catId);
    if (!cat) return;

    if (this.category && this.category['_id'] == cat._id) {
      this.category = undefined;
      this.filter.category = undefined;
      this.filter.age = undefined;
    } else {
      this.category = { ...cat };
      this.filter.category = cat._id;
    }

    this.sizes = [];
    this.filter.size = [];
    this.filter.piece = [];

    if (this.filter.age != null) this.mountSizes(this.filter.age);

    this.mountPieces();

    this.filtersChanged();
  }

  private multipleSelected(property: string, item: BasicModel) {
    if (!notNullOrEmpty(this.filter[property])) return false;

    if (Array.isArray(this.filter[property])) {
      return this.filter[property].find((el) => el === item._id) != null;
    } else {
      return this.filter[property] === item._id;
    }
  }

  select(property: string, item?: BasicModel) {
    if (Filters.booleanFilters.includes(property)) {
      if (!this.filter[property]) this.filter[property] = true;
      else delete this.filter[property];

      this.filtersChanged();
      return;
    }

    if (!item) return;

    if (Filters.singleChoiceFilters.includes(property))
      this.selectSingle(property, item);
    else this.selectMultiple(property, item);
  }

  selected(property: string, item: BasicModel) {
    if (Filters.singleChoiceFilters.includes(property))
      return this.filter[property] === item._id;
    else return this.multipleSelected(property, item);
  }

  selectMultiple(property: string, item: BasicModel) {
    const index = this.filter[property].findIndex(
      (el: number | string) => el.toString() === item._id.toString(),
    );

    if (index >= 0) {
      this.filter[property].splice(index, 1);
    } else {
      const els = [...this.filter[property]];
      els.push(item._id);
      this.filter[property] = els;
    }
    this.filtersChanged();
  }

  // special, gender, condition
  selectSingle(property: string, item: BasicModel) {
    if (this.filter[property] == null) this.filter[property] = item._id;
    else if (this.filter[property] === item._id) this.filter[property] = null;
    else this.filter[property] = item._id;

    this.filtersChanged();
  }

  changeCost() {
    const _lower = this.filter.costLower;
    const _upper = this.filter.costUpper;

    let invalid = false;

    if (this.sections.cost) {
      const lower = this.costRange.lower;
      const upper = this.costRange.upper;

      if (
        lower != null &&
        (lower > this.maxCost ||
          lower < this.minCost ||
          (upper != null && lower > upper))
      ) {
        invalid = true;
      } else if (lower != null) {
        this.filter.costLower = lower * 100;
      }

      if (
        upper != null &&
        (upper > this.maxCost ||
          upper < this.minCost ||
          (lower != null && lower > upper))
      ) {
        invalid = true;
      } else if (upper != null) {
        this.filter.costUpper = upper * 100;
      }
    } else {
      this.filter.costLower = undefined;
      this.filter.costUpper = undefined;
    }

    if (
      (!invalid && _lower != this.filter.costLower) ||
      _upper != this.filter.costUpper
    )
      this.filtersChanged();
  }

  changeSorting() {
    this.filtersChanged();
  }

  async filtersChanged() {
    setTimeout(() => {
      const filter = new Filters({ ...this.filter });
      this.filtersChange.emit(filter);
    }, 100);
  }

  // sections checking
  checkSectionGender() {
    if (this.sections.gender) return;
    this.filter.gender = [];
    this.filtersChanged();
  }

  checkSectionSize() {
    this.filter['size'] = [];
    if (!this.sections.size) {
      this.filter.age = undefined;
      this.sizes = [];
      this.filtersChanged();
    }
  }

  checkSectionCondition() {
    if (this.sections.condition) return;
    this.filter.condition = [];
    this.filtersChanged();
  }

  checkSectionCost() {
    if (this.sections.cost) return;
    this.filter.costLower = undefined;
    this.filter.costUpper = undefined;
    this.costRange.lower = null;
    this.costRange.upper = null;
    this.filtersChanged();
  }

  checkSectionCategory() {
    if (this.sections.category) return;

    this.sizes = [];
    this.category = undefined;
    this.sections.size = false;

    this.filter.size = [];
    this.filter.age = undefined;
    this.filter.category = undefined;
    this.filter.piece = [];

    this.filtersChanged();
  }

  resetLocalFilter() {
    if (!this.filter.size) this.filter.size = [];
    if (!this.filter.piece) this.filter.piece = [];
    if (!this.filter.gender) this.filter.gender = [];
    if (!this.filter.condition) this.filter.condition = [];

    if (this.filter.category != null) {
      const cat = this.itemsMap?.category.find(
        (c) => c._id === this.filter.category,
      );
      if (cat) {
        this.category = { ...cat };
        this.mountPieces();
      }
      if (this.filter.age != null) this.mountSizes(this.filter.age);
    }

    this.openSections();
  }

  ngOnChanges(): void {
    this.openSections();

    if (
      !this.itemsMap ||
      (this.filter.category == null && this.category == null)
    )
      return;

    if (this.filter.category !== this.category?._id) {
      this.category = this.itemsMap.category.find(
        (cat) => cat._id === this.filter.category,
      );
      this.mountPieces();
      this.sizes = [];
    }
  }

  close() {
    this.dismiss.emit();
  }

  ngOnDestroy(): void {
    if (this.itemsMapSub) this.itemsMapSub.unsubscribe();
  }
}
