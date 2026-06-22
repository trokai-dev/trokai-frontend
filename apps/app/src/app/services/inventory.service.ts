import { Clothes } from '@trokai/shared-core';
import { SellerFees } from '@trokai/shared-core';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, lastValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  Filters,
  SearchResponse,
  UploadPictureItem,
} from '@trokai/shared-core';
import { AlertService } from '@trokai/shared-ui';
import { GlobalService } from './global.service';
import { CatalogService } from '@trokai/shared-data-access';

/**
 * A picture slot as perceived by the upload pipeline.
 *
 * - `blob !== null`  → new or re-cropped image; always sent as a file upload.
 * - `blob === null`  → unmodified server image; identified by `serverId`.
 *                      On PATCH the backend keeps it in place via its _id.
 *                      `serverUrl` (.lg) lets us re-fetch the blob for duplication/cropping.
 */

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private http = inject(HttpClient);
  private globalService = inject(GlobalService);
  private alertService = inject(AlertService);
  private catalog = inject(CatalogService);

  public _recentProducts = new BehaviorSubject<
    Map<string, Clothes | undefined>
  >(new Map());

  item: Clothes = new Clothes();
  /** Upload pipeline buffer. Holds UploadPictureItem[] while editing/creating an item. */
  pendingPictures: UploadPictureItem[] = [];

  // delegate to CatalogService (single source); '' preserves old contract
  getGenderName(gender: number) {
    return this.catalog.getGenderName(gender) ?? '';
  }

  getConditionName(condition: number) {
    return this.catalog.getConditionName(condition) ?? '';
  }

  getAgeName(age: number) {
    return this.catalog.getAgeName(age) ?? '';
  }

  getCategoryName(category: number) {
    return this.catalog.getCategoryName(category) ?? '';
  }

  getPieceName(piece: number, category: number) {
    return this.catalog.getPieceName(piece, category) ?? '';
  }

  getSizeName(size: number, category: number, age: number) {
    return this.catalog.getSizeName(size, category, age) ?? '';
  }

  updateClothe(id, formData) {
    return this.http.patch<Clothes>(
      environment.urlApi + '/products/' + id,
      formData,
    );
  }

  addClothe(formData) {
    return this.http.post<Clothes>(environment.urlApi + '/products', formData);
  }

  resetItem() {
    this.item = new Clothes();
    this.pendingPictures = [];
  }

  checkInventoryLimit() {
    return this.http
      .get(environment.urlApi + '/users/me/verify-clothes-limit')
      .pipe(
        map((res) => {
          if (!res['allowed'])
            this.alertService.showAlert('Armário cheio', res['message']);

          return res['allowed'];
        }),
      );
  }

  async deleteItem(item) {
    try {
      await lastValueFrom(
        this.http.delete(`${environment.urlApi}/clothes/${item._id}`),
      );

      this._recentProducts.next(
        new Map(this._recentProducts.value).set(item._id, undefined),
      );
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
      // ── PATCH ──────────────────────────────────────────────────────────────
      // Tell the backend exactly what to do with each slot:
      //   { op: 'keep', filename }  → reuse the existing server file as-is
      //   { op: 'new',  blobIndex } → replace/insert with the blob at that index
      // Only new blobs are transmitted; kept images are referenced by filename.
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
      // ── POST ───────────────────────────────────────────────────────────────
      // New item: every slot must have a blob — append them in order.
      for (const slot of pictures) {
        if (slot.blob) formData.append('images', slot.blob);
      }
    }

    const newItem = { ...this.item };
    delete newItem.images;

    const itemId = newItem._id;
    if (itemId) delete newItem._id;

    formData.append('body', JSON.stringify(newItem));

    try {
      let response;

      if (this.item._id) {
        this.resetItem();
        response = await lastValueFrom(this.updateClothe(itemId, formData));
      } else {
        response = await lastValueFrom(this.addClothe(formData));
      }

      if (response?._id) {
        this._recentProducts.next(
          new Map(this._recentProducts.value).set(response._id, response),
        );
      }

      return response;
    } catch {
      throw new Error('Erro ao publicar anúncio');
    }
  }

  async startDuplicate(selectedItem: Clothes) {
    this.item.copyOf = selectedItem._id;
    this.startEditing(selectedItem);

    // Pre-fetch all server images as blobs before navigating to the form so the
    // image picker treats each picture as a brand-new local image (serverId = null).
    // This prevents any reference to the original item's server files.
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

  // Prepara o objeto para ser editado
  startEditing(selectedItem) {
    this.item.age = selectedItem.age;
    this.item.category = selectedItem.category;
    this.item.condition = selectedItem.condition;
    this.item.cost = selectedItem.cost;
    this.item.description = selectedItem.description;
    this.item.gender = selectedItem.gender;
    this.item.piece = selectedItem.piece;
    this.item.sell = selectedItem.sell;
    this.item.size = selectedItem.size;
    this.item.title = selectedItem.title;
    this.item.weight = selectedItem.weight;
    this.item.declaredValue = selectedItem.declaredValue;
    this.item.firstCost = selectedItem.firstCost;
    this.item._id = selectedItem._id;
    this.item.brand = selectedItem.brand;

    this.pendingPictures = (selectedItem.images ?? [])
      .filter((img) => img?.sm || img?.lg)
      .map(
        (img): UploadPictureItem => ({
          blob: null,
          serverId: img._id ?? null,
          serverUrl: img.lg ?? null,
          smUrl: img.sm ?? null,
        }),
      );
  }

  getSellerFees(cost) {
    return lastValueFrom(
      this.http.get<SellerFees>(
        `${environment.urlApi}/payments/seller-fees?value=${cost}`,
      ),
    );
  }

  // Transforma a url web da imagem em Base 64
  getBase64FromURL(imgUrl) {
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.addEventListener(
        'load',
        function () {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
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

  renewProduct(productId) {
    return lastValueFrom(
      this.http.patch(
        environment.urlApi + '/clothes/' + productId + '/renew',
        {},
      ),
    );
  }

  deactivateProduct(productId) {
    return lastValueFrom(
      this.http.patch(
        environment.urlApi + '/clothes/' + productId + '/deactivate',
        {},
      ),
    );
  }

  activateProduct(productId) {
    return lastValueFrom(
      this.http.patch(
        environment.urlApi + '/clothes/' + productId + '/activate',
        {},
      ),
    );
  }

  renewAll(userId) {
    return lastValueFrom(
      this.http.patch(`${environment.urlApi}/clothes/renew/user/${userId}`, {}),
    );
  }

  async getMyClothes(
    skip = 0,
    limit = 30,
    filter?: Filters,
    exclude = [],
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

    const recentProducts = this._recentProducts.value;

    if (recentProducts.size > 0) {
      const existingIds = new Set(response.clothes.map((c) => c._id));

      const toInject: Clothes[] = [];

      for (const [id, product] of recentProducts) {
        if (existingIds.has(id)) {
          if (product === undefined) {
            response.clothes = response.clothes.filter((c) => c._id !== id);
            response.count--;
          }
        } else if (product) {
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

  reset() {
    this._recentProducts.next(new Map());
  }
}
