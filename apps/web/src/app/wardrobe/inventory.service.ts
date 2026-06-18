import { Clothes } from '@trokai/shared-core';
import { SellerFees } from '@trokai/shared-core';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GlobalService } from '../services/global.service';
import { AlertService } from '@trokai/shared-ui';

import {
  Filters,
  SearchResponse,
  UploadPictureItem,
} from '@trokai/shared-core';

/**
 * A picture slot in the upload pipeline.
 *
 * - `blob !== null`  → new or re-cropped image; always sent as a file upload.
 * - `blob === null`  → unmodified server image identified by `serverId`.
 *                      On PATCH the backend keeps it in place via its _id.
 *                      `serverUrl` (.lg) lets us re-fetch the blob for cropping.
 */
@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private http = inject(HttpClient);
  private globalService = inject(GlobalService);
  private alertService = inject(AlertService);

  /**
   * Short-lived cache of products returned by upload() (POST or PATCH).
   * Keyed by _id. Entries are evicted the first time the product appears in
   * a getMyClothes() response, preventing duplication and releasing memory.
   */
  private _recentProducts = new Map<string, Clothes>();

  /** Working copy of the product being created/edited. */
  item: Clothes = new Clothes();
  /** Upload pipeline buffer. Holds UploadPictureItem[] while editing/creating an item. */
  pendingPictures: UploadPictureItem[] = [];

  getGenderName(gender: number) {
    return (
      this.globalService
        .getItemsMapValue()
        ?.gender.find((g) => g._id === gender)?.value ?? ''
    );
  }

  getSpecialName(special: number) {
    return (
      this.globalService
        .getItemsMapValue()
        ?.special.find(
          (s) => s._id.toString().trim() === special.toString().trim(),
        )?.value ?? ''
    );
  }

  getConditionName(condition: number) {
    return (
      this.globalService
        .getItemsMapValue()
        ?.condition.find((c) => c._id === condition)?.value ?? ''
    );
  }

  getAgeName(age: number) {
    return (
      this.globalService.getItemsMapValue()?.age.find((c) => c._id === age)
        ?.value ?? ''
    );
  }

  getCategoryName(category: number) {
    return (
      this.globalService
        .getItemsMapValue()
        ?.category.find((c) => c._id === category)?.value ?? ''
    );
  }

  getPieceName(piece: number, category: number) {
    const selectedCategory = this.globalService
      .getItemsMapValue()
      ?.category.find((c) => c._id === category);
    return (
      selectedCategory?.['pieces']?.find((p) => p._id === piece)?.value ?? ''
    );
  }

  getSizeName(size: number, category: number, age: number) {
    if (size === null || category === null || age === null) return '';

    const selectedCategory = this.globalService
      .getItemsMapValue()
      ?.category.find((c) => c._id === category);

    return (
      selectedCategory?.['sizes']?.[age]?.find((s) => s._id === size)?.value ??
      ''
    );
  }

  getItemReview() {
    return lastValueFrom(
      this.http.get<[]>(environment.urlApi + '/clothes/item-review'),
    );
  }

  updateClothe(id: string, formData: FormData) {
    return this.http.patch<Clothes>(
      environment.urlApi + '/products/' + id,
      formData,
    );
  }

  addClothe(formData: FormData) {
    return this.http.post<Clothes>(environment.urlApi + '/products', formData);
  }

  resetItem() {
    this.item = new Clothes();
    this.pendingPictures = [];
  }

  /**
   * Populate `item` and `pendingPictures` from an existing Clothes object.
   * Uses the new `images` field (resolved URLs) to build UploadPictureItem[] slots.
   */
  startEditing(selectedItem: Clothes) {
    this.item = new Clothes({ ...selectedItem });
    this.pendingPictures = (selectedItem.images ?? [])
      .filter((img) => img?.sm || img?.lg)
      .map((img) => ({
        blob: null as Blob | null,
        serverId: img._id ?? null,
        serverUrl: img.lg ?? null,
        smUrl: img.sm ?? null,
      }));
  }

  /**
   * Prepare a duplicate. Calls startEditing then pre-fetches all server images as
   * blobs with serverId = null so the form treats every picture as a brand-new
   * local image with no reference to the original item's server files.
   */
  async startDuplicate(selectedItem: Clothes) {
    this.startEditing(selectedItem);
    this.item.copyOf = selectedItem._id;

    const pictures = this.pendingPictures.slice();
    for (let i = 0; i < pictures.length; i++) {
      const slot = pictures[i];
      if (!slot.blob && slot.serverUrl) {
        try {
          const res = await fetch(`${slot.serverUrl}?${Date.now()}`);
          const raw = await res.blob();
          const blob = new Blob([raw], {
            type: raw.type.startsWith('image/') ? raw.type : 'image/jpeg',
          });
          pictures[i] = {
            blob,
            serverId: null,
            serverUrl: slot.serverUrl,
            smUrl: slot.smUrl,
          };
        } catch {
          /* keep original slot — duplicate() will retry on submit */
        }
      }
    }
    this.pendingPictures = pictures;
  }

  async getMyClothes(
    skip = 0,
    limit = 30,
    filter?: Filters,
    exclude: string[] = [],
  ): Promise<SearchResponse> {
    const response = await lastValueFrom(
      this.http.get<SearchResponse>(`${environment.urlApi}/products/me`, {
        params: {
          skip,
          limit,
          ...filter,
          exclude,
        },
      }),
    );

    if (this._recentProducts.size > 0) {
      const existingIds = new Set(response.clothes.map((c) => c._id));
      const toInject: Clothes[] = [];

      for (const [id, product] of this._recentProducts) {
        if (existingIds.has(id)) {
          // Product is now visible in the backend response — evict from cache.
          this._recentProducts.delete(id);
        } else {
          toInject.push(product);
        }
      }

      if (toInject.length > 0) {
        response.clothes = [...toInject, ...response.clothes];
        response.count += toInject.length;
      }
    }

    return response;
  }

  async deleteItem(item: Clothes) {
    try {
      await lastValueFrom(
        this.http.delete(`${environment.urlApi}/clothes/${item._id}`),
      );

      // try delete from cache in case the item is still there
      if (item._id) this._recentProducts.delete(item._id);
    } catch {
      /* intentional */
    }
  }

  async duplicate() {
    // All blobs must have been pre-fetched by startDuplicate before navigating to the form.
    // If any slot is still missing a blob, the pre-fetch failed — abort rather than silently
    // sending a broken or incomplete item.
    const missing = this.pendingPictures.some((s) => !s.blob);
    if (missing)
      throw new Error(
        'Não foi possível carregar todas as imagens para duplicar o anúncio',
      );

    delete this.item._id;
    await this.upload();
  }

  async upload(): Promise<Clothes> {
    const formData = new FormData();
    const pictures = this.pendingPictures;
    const isEdit = !!this.item._id;

    if (isEdit) {
      // ── PATCH ─────────────────────────────────────────────────────────────────
      // Tell the backend exactly what to do with each slot:
      //   { op: 'keep', id }       → reuse the existing server image as-is
      //   { op: 'new',  blobIndex } → replace/insert with the blob at that index
      let blobIndex = 0;
      const picturesMap = pictures.map((slot) => {
        if (slot.blob) {
          formData.append('images', slot.blob);
          return { op: 'new', blobIndex: blobIndex++ };
        }
        return { op: 'keep', id: slot.serverId };
      });
      formData.append('pictures_map', JSON.stringify(picturesMap));
    } else {
      // ── POST ─────────────────────────────────────────────────────────────────
      // New item: every slot must have a blob — append them in order.
      for (const slot of pictures) {
        if (slot.blob) formData.append('images', slot.blob);
      }
    }

    const newItem: Partial<Clothes> = { ...this.item };
    delete newItem.images;
    delete newItem.pictures;
    delete newItem.smallPicture;

    const itemId = newItem._id;
    if (itemId) delete newItem._id;

    formData.append('body', JSON.stringify(newItem));

    try {
      let response: Clothes;

      if (itemId) {
        this.resetItem();
        response = await lastValueFrom(this.updateClothe(itemId, formData));
      } else {
        response = await lastValueFrom(this.addClothe(formData));
        this.resetItem();
      }

      // Cache the freshly registered/updated product so getMyClothes() can
      // inject it if the backend hasn't indexed it yet.
      if (response?._id) {
        this._recentProducts.set(response._id, response);
      }

      return response;
    } catch {
      throw new Error('Erro ao publicar anúncio');
    }
  }

  getDeclaredValue(cost: number) {
    return lastValueFrom(
      this.http.get<SellerFees>(
        `${environment.urlApi}/payments/seller-fees?value=${cost}`,
      ),
    );
  }

  // Transforma a url web da imagem em Base 64
  getBase64FromURL(imgUrl: string) {
    const img = new Image();

    return new Promise((resolve) => {
      img.addEventListener(
        'load',
        function () {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg');

          resolve(dataURL);
        },
        false,
      );

      // set attributes and src
      img.setAttribute('crossOrigin', 'Anonymous');
      img.src = imgUrl + '?' + new Date().getTime().toString();
    });
  }

  renewProduct(productId: string) {
    return lastValueFrom(
      this.http.patch(
        environment.urlApi + '/clothes/' + productId + '/renew',
        {},
      ),
    );
  }

  renewAll(userId: string) {
    return lastValueFrom(
      this.http.patch(`${environment.urlApi}/clothes/renew/user/${userId}`, {}),
    );
  }

  deactivateProduct(productId: string) {
    return lastValueFrom(
      this.http.patch(
        environment.urlApi + '/clothes/' + productId + '/deactivate',
        {},
      ),
    );
  }

  activateProduct(productId: string) {
    return lastValueFrom(
      this.http.patch(
        environment.urlApi + '/clothes/' + productId + '/activate',
        {},
      ),
    );
  }

  reset() {
    this._recentProducts.clear();
  }
}
