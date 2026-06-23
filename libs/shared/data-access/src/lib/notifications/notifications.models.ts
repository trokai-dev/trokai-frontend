export const NotificationType = {
  // SWAP
  SwapCreated: 'swap.created',
  SwapAccepted: 'swap.accepted',
  SwapCanceled: 'swap.canceled',
  SwapExpiredOwner: 'swap.expired.owner',
  SwapExpiredBuyer: 'swap.expired.buyer',
  SwapReviewCreate: 'swap.review.created',
  SwapReviewCreatedByOtherUser: 'swap.review.createdByOtherUser',
  // ORDER
  OrderPaymentApprovedBuyer: 'order.paymentApproved.buyer',
  OrderPaymentReproved: 'order.paymentReproved',
  OrderPaymentApprovedSellerShipping: 'order.paymentApproved.seller.shipping',
  OrderPaymentApprovedSellerInPerson: 'order.paymentApproved.seller.inPerson',
  OrderSent: 'order.sent',
  OrderDelivered: 'order.delivered',
  OrderReviewCreate: 'order.review.create',
  OrderCanceled: 'order.canceled',
  OrderReviewCreatedByOtherUser: 'order.review.createdByOtherUser',
  OrderPostageLabelExpired: 'order.postageLabelExpired',
  OrderShippingReminder: 'order.shippingReminder',
  // CLOTHES
  ClothesAdjust: 'clothes.adjust',
  ClothesExpired: 'clothes.expired',
  ClothesReproved: 'clothes.reproved',
  ClothesApproved: 'clothes.approved',
  ClothesQuestionCreated: 'clothes.question.created',
  ClothesQuestionAnswered: 'clothes.question.answered',
  // FAVORITES
  FavoritesCreated: 'favorites.created',
  // TRANSFERS
  TransferCompleted: 'transfer.completed',
  TransferFailed: 'transfer.failed',
  // SYSTEM
  SystemAlert: 'system.alert',
};

export enum NotificationCategory {
  SWAP = 'swap',
  ORDER = 'order',
  CLOTHES = 'clothes',
  FAVORITES = 'favorites',
  TRANSFER = 'transfer',
  SOCIAL = 'social',
  SYSTEM = 'system',
}

/**
 * Server-rendered notification (snake_case wire contract). The backend now
 * resolves title/description/icon/link, so the client just displays them.
 */
export class NotificationModel {
  id!: string;
  type!: string;
  category!: string;
  title!: string;
  description!: string;
  image_url!: string | null;
  target_url!: string | null;
  is_read!: boolean;
  created_at!: Date;
}

export interface NotificationsResponse {
  data: NotificationModel[];
  meta: {
    unread_count: number;
    skip: number;
    limit: number;
    has_more: boolean;
  };
}
