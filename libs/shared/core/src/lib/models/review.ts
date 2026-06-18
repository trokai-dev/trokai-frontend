export interface UserReview {
  _id: string;
  madeBy: string;
  negotiationId: string;
  type: 'order';
  stars: number;
  comment?: string;
  createdAt: Date;
  hidden?: boolean;
}
