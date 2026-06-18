import { Clothes } from './clothes';

export class Collection {
  _id!: string;
  name!: string;
  slug!: string;
  clothes: Clothes[];
  allowRandomSort?: boolean;
  count?: number;

  constructor(init?: Partial<Collection>) {
    this.clothes = [];
    if (init) Object.assign(this, init);
  }
}
