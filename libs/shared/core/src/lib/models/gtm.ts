import { Clothes } from './clothes';

export class GtmProductData {
  item_id: string;
  item_name: string;
  item_brand: string;
  price: number;
  quantity: 1;

  constructor(input: Partial<Clothes>) {
    this.item_id = input._id || '';
    this.item_name = input.title || '';
    this.item_brand = input.brand?.name || '';
    this.price = (input.cost ?? 0) / 100;
    this.quantity = 1;
  }
}
