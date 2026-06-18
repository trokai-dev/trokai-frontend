import { User } from '@trokai/shared-core';

export class ReviewModel {
  negotiationId!: string;
  stars!: number;
  comment?: string;
  type?: 'order';
  madeByUser?: User; // web
  createdAt?: Date; // web
}
