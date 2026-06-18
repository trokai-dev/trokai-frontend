import { Clothes } from './clothes';

export class SearchResponse {
  count!: number;
  clothes!: Clothes[];
}

export class UserSearchResponse {
  count!: number;
  users!: Clothes[];
}

export class CollectionResponse {
  name!: string;
  count!: number;
  clothes!: Clothes[];
}
