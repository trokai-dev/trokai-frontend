import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG, Clothes, SellerFees, User } from '@trokai/shared-core';
import { lastValueFrom } from 'rxjs';
import { CatalogService } from '../catalog/catalog.service';
import { ClothesPayment } from './product.models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private urlApi = inject(APP_CONFIG).urlApi;
  private catalog = inject(CatalogService);

  // name lookups delegate to CatalogService (single source)
  getGenderName(gender: number) {
    return this.catalog.getGenderName(gender);
  }
  getSpecialName(special: number) {
    return this.catalog.getSpecialName(special);
  }
  getConditionName(condition: number) {
    return this.catalog.getConditionName(condition);
  }
  getAgeName(age: number) {
    return this.catalog.getAgeName(age);
  }
  getCategoryName(category: number) {
    return this.catalog.getCategoryName(category);
  }
  getPieceName(piece: number, category: number) {
    return this.catalog.getPieceName(piece, category);
  }
  getSizeName(size: number, category: number, age: number) {
    return this.catalog.getSizeName(size, category, age);
  }

  fetchProduct(productId: string) {
    return lastValueFrom(
      this.http.get<{
        clothes: Clothes;
        otherClothes: Clothes[];
        user: User;
      }>(`${this.urlApi}/clothes/${productId}`),
    );
  }

  getSellerFees(cost: number) {
    return lastValueFrom(
      this.http.get<SellerFees>(
        `${this.urlApi}/payments/seller-fees?value=${cost}`,
      ),
    );
  }

  fetchCompleteProduct(productId: string) {
    return lastValueFrom(
      this.http.get<{ clothes: Clothes; payment: ClothesPayment }>(
        `${this.urlApi}/clothes/${productId}/details`,
      ),
    );
  }

  askQuestion(clothesId: string, question: string) {
    return lastValueFrom(
      this.http.post(`${this.urlApi}/clothes/question`, { clothesId, question }),
    );
  }

  answerQuestion(questionId: string, clothesId: string, answer: string) {
    return lastValueFrom(
      this.http.post(`${this.urlApi}/clothes/answer`, {
        questionId,
        clothesId,
        answer,
      }),
    );
  }

  // consumers call .subscribe() — keep Observable
  visitItem(_id: string) {
    return this.http.patch(`${this.urlApi}/users/clothes-visited`, { id: _id });
  }

  mountProductLink(product: Clothes): string {
    let str = product.title.toString().trim().toLowerCase();
    str = str.replace(/[àáâãäå]/g, 'a');
    str = str.replace(/[èéêë]/g, 'e');
    str = str.replace(/[íìïî]/g, 'i');
    str = str.replace(/[óòõôö]/g, 'o');
    str = str.replace(/[úùüû]/g, 'u');
    str = str.replace(/[ ]/g, '-');
    return `/items/${str}-${product._id}`;
  }
}
