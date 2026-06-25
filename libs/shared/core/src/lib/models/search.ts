import { Clothes } from './clothes';
import { User } from './user';

export class SearchResponse {
  count!: number;
  clothes!: Clothes[];
}

export class UserSearchResponse {
  count!: number;
  users!: User[];
}

export class CollectionResponse {
  name!: string;
  count!: number;
  clothes!: Clothes[];
}
