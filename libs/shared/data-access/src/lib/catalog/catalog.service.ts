import { Injectable } from '@angular/core';
import { ItemsMap } from '@trokai/shared-core';
import { BehaviorSubject } from 'rxjs';

/**
 * Single source for items-map (/init catalog) name lookups. Both apps feed it
 * via setItemsMap() after fetching /init; ProductService + the ItemNamePipe
 * read from here so the lookup logic lives in exactly one place.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private _itemsMap = new BehaviorSubject<ItemsMap | null>(null);

  get itemsMap$() {
    return this._itemsMap.asObservable();
  }

  setItemsMap(map: ItemsMap) {
    this._itemsMap.next(map);
  }

  getItemsMapValue() {
    return this._itemsMap.getValue();
  }

  getGenderName(gender: number) {
    return this.getItemsMapValue()?.gender.find((g) => g._id === gender)?.value;
  }

  getSpecialName(special: number) {
    return this.getItemsMapValue()?.special.find((s) => s._id === special)
      ?.value;
  }

  getConditionName(condition: number) {
    return this.getItemsMapValue()?.condition.find((c) => c._id === condition)
      ?.value;
  }

  getAgeName(age: number) {
    return this.getItemsMapValue()?.age.find((c) => c._id === age)?.value;
  }

  getCategoryName(category: number) {
    return this.getItemsMapValue()?.category.find((c) => c._id === category)
      ?.value;
  }

  getPieceName(piece: number, category: number) {
    const selectedCategory = this.getItemsMapValue()?.category.find(
      (c) => c._id === category,
    );
    if (selectedCategory)
      return selectedCategory.pieces.find((p) => p._id === piece)?.value;
    return null;
  }

  getSizeName(size: number, category: number, age: number) {
    if (size == null || age == null) return null;

    const selectedCategory = this.getItemsMapValue()?.category.find(
      (c) => c._id === category,
    );

    if (
      !selectedCategory ||
      !selectedCategory.sizes ||
      !selectedCategory.sizes.length
    )
      return null;

    return selectedCategory.sizes[age].find((s) => s._id === size)?.value ?? null;
  }
}
