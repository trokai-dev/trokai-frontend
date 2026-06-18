import { BasicModel } from './basic';

export class CategoryModel {
  sizes!: BasicModel[][];
  _id!: number;
  value!: string;
  pieces!: BasicModel[];
}

export class ItemsMap {
  gender!: BasicModel[];
  age!: BasicModel[];
  condition!: BasicModel[];
  special!: BasicModel[];
  category!: CategoryModel[];
}
