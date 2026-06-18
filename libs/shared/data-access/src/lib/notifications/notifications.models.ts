export const NotificationType = {
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
};

export class NotificationModel {
  _id!: string;
  type!: string;
  message!: string;
  createdAt!: Date;
  read!: boolean;
}
