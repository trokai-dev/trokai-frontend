import { Address, User } from './user';
import { Clothes } from './clothes';
import { UserReview } from './review';
import { AddressOption } from './address-option';
import { PostageAgency } from './postage-agency';
import {
  isTransportadora,
  ShippingServiceName,
  ShippingServices,
} from './shipping';

export enum OrderStatus {
  WAITING_PAYMENT,
  PAYMENT_APPROVED,
  PAYMENT_FAILED,
  WAITING_SHIPMENT,
  WAITING_WITHDRAWAL,
  ORDER_SENT,
  ORDER_DELIVERED,
  WAITING_REVIEW,
  CONCLUDED,
  CANCELED,
  PAYMENT_REFUNDED,
  RETURN_REQUESTED,
  RETURNED,
  PIX_EXPIRED,
}

export const AllowedChatInStatuses = [
  OrderStatus.PAYMENT_APPROVED,
  OrderStatus.WAITING_SHIPMENT,
  OrderStatus.WAITING_WITHDRAWAL,
  OrderStatus.ORDER_SENT,
  OrderStatus.ORDER_DELIVERED,
];

export enum OrderStatusString {
  'Aguardando pagamento',
  'Pagamento aprovado',
  'Pagamento recusado',
  'Aguardando envio',
  'Aguardando retirada',
  'Produto enviado',
  'Produto entregue',
  'Aguardando avaliações',
  'Concluído',
  'Cancelado',
  'Estorno realizado',
  'Devolução solicitada',
  'Produto devolvido',
  'PIX expirado',
}

export class Pix {
  encodedImage!: string;
  expirationDate!: Date;
  payload!: string;
}

export class OrderListItem {
  _id!: string;
  customId!: string;
  buyer!: string;
  seller!: string;
  status!: OrderStatus;
  createdAt!: Date;
  updatedAt!: Date;
  clothes!: Clothes[];
  shippingType!: AddressOption;
  businessValues!: {
    buyerCost: number;
    sellerSplitBeforeAnticipation: number;
  };
}

export class OrderDisplay {
  _id!: string;
  customId!: string;
  status!: string;
  sellerProfit?: number;
  buyerCost?: number;
  value!: number;
  images: string[] = [];
  updatedAt!: Date;
  createdAt!: Date;
  discount?: number;
  clothes!: Clothes[];
}

export enum PostageLabelStatus {
  NOT_CREATED,
  CREATED,
  EXPIRED,
}

export enum OrderCanceledBy {
  BUYER = 'buyer',
  SELLER = 'seller',
  TROKAI = 'trokai',
}

export enum OrderCancellationReason {
  OUT_OF_STOCK = 'out_of_stock',
  WRONG_PRICE = 'wrong_price',
  BUYER_REQUESTED = 'buyer_requested',
  SELLER_REQUESTED = 'seller_requested',
  TROKAI_DECISION = 'trokai_decision',
  OTHER = 'other',
}

export interface OrderCancellation {
  canceledBy: OrderCanceledBy;
  canceledAt?: Date;
  reason?: OrderCancellationReason;
  description?: string;
}

export class Order {
  _id!: string;
  customId!: string;
  payment!: {
    paymentMethod: string;
    creditCard: {
      installments: number;
    };
  };
  buyer!: User;
  seller!: User;
  shippingType!: number;
  shippingAddress!: Address;
  inPersonCity!: string;
  status!: OrderStatus;
  createdAt!: Date;
  updatedAt!: Date;
  clothes!: Clothes[];
  postageLabel?: {
    // old
    correiosCard: string;
    correiosContrato: string;
    //expirationDate: Date;
    object: string;
    plp: number;

    // new
    melhorEnvioId: string;
    melhorEnvioOrderProtocol: string;
    melhorEnvioAgencyId: string;
    melhorEnvioAgency: PostageAgency;
    melhorEnvioPurchaseId: string;
    melhorEnvioPurchaseProtocol: string;
    melhorEnvioPaidAt: string;
    melhorEnvioStatus: string;
    melhorEnvioTracking: string | null;
    melhorEnvioSelfTracking: string | null;
    melhorEnvioAuthorizationCode: string | null;
    melhorEnvioUrl: string;
    expirationDate: Date;
  };

  reviews?: UserReview[];
  cancellation?: OrderCancellation;
  buyerReviewedAt?: Date;
  shippingCorrection?: boolean;
  reviewReminderSentAt?: {
    inApp?: Date;
    push?: Date;
    whatsapp?: Date;
    email?: Date;
  };
  returnedBy?: string;
  sellerShippingAddress?: Address;
  pix?: Pix;
  businessValues?: {
    buyerCost: number;
    sellerSplitBeforeAnticipation: number;
    buyerProcessingFee: number;
    buyerServiceFee: number;
    cartDiscount: number;
    clothesCost: number;
    shippingCost: number;
    couponCode: string;
    couponDiscount: number;
    pixDiscount: number;
    pixDiscountPercentage: number;
    sellerFinalPercentageFee: number;
    sellerPercentageFee: number;
    shippingDiscount: number;
    trokaiDeclaredValueFee: number;
    interestValues: {
      buyerCost: number;
      installmentValue: number;
      installments: number;
      interest: number;
      interestPercentage: number;
    };
  };
  shippingValues?: {
    shippingCost: number;
    finalDeclaredValue?: number;
    service: ShippingServices;
    maxDeliveryTime: number;
  };

  statusHistory?: { status: OrderStatus; createdAt: Date }[];

  // legacy
  postageInfo?: {
    data: string;
    date: Date;
    hora: string;
    status: string;
    _id: string;
  }[];

  constructor(init: Partial<Order>) {
    Object.assign(this, init);

    // new agency object
    if (this.postageLabel?.melhorEnvioAgency) {
      this.postageLabel.melhorEnvioAgency = new PostageAgency(
        this.postageLabel.melhorEnvioAgency,
      );
    }
  }

  // SHIPPING
  get isLegacyShipping() {
    return !!this.postageInfo;
  }

  get isShipping() {
    return this.shippingType === AddressOption.SHIPPING;
  }

  get processedAndValid() {
    const invalidStatuses = [
      OrderStatus.CANCELED,
      OrderStatus.PAYMENT_REFUNDED,
      OrderStatus.PIX_EXPIRED,
      OrderStatus.PAYMENT_FAILED,
      OrderStatus.WAITING_PAYMENT,
    ];

    return !invalidStatuses.includes(this.status);
  }

  get shippingStatus() {
    if (this.shippingType === AddressOption.INPERSON) {
      switch (this.status) {
        case OrderStatus.PAYMENT_APPROVED:
        case OrderStatus.WAITING_WITHDRAWAL:
          return 'Aguardando retirada';

        case OrderStatus.WAITING_REVIEW:
        case OrderStatus.CONCLUDED:
          return 'Retirada concluída';

        default:
          return '-';
      }
    } else {
      switch (this.status) {
        case OrderStatus.PAYMENT_APPROVED:
        case OrderStatus.WAITING_SHIPMENT:
          return 'Aguardando envio';

        case OrderStatus.ORDER_SENT:
          return 'Em transporte';

        case OrderStatus.ORDER_DELIVERED:
        case OrderStatus.WAITING_REVIEW:
        case OrderStatus.CONCLUDED:
          return 'Entregue';

        case OrderStatus.RETURN_REQUESTED:
          return 'Devolução solicitada';

        case OrderStatus.RETURNED:
          return 'Devolvido';

        default:
          return '-';
      }
    }
  }

  get isTransportadora(): boolean {
    return this.shippingValues?.service
      ? isTransportadora(this.shippingValues.service)
      : false;
  }

  get shippingServiceName(): string {
    if (this.isLegacyShipping || !this.shippingValues?.service)
      return 'Correios';
    return (ShippingServiceName as Record<string, string>)[
      this.shippingValues.service
    ];
  }

  get legacyTrackingCode(): string | undefined {
    return this.postageLabel?.object;
  }

  get melhorEnvioTrackingUrl(): string | undefined {
    if (
      this.isLegacyShipping ||
      !this.postageLabel?.melhorEnvioSelfTracking ||
      !this.shippingValues?.service
    )
      return undefined;

    return `https://melhorrastreio.com.br/${this.postageLabel.melhorEnvioSelfTracking}`;
  }

  get postageLabelExpiration(): Date | undefined {
    return this.postageLabel?.expirationDate
      ? new Date(this.postageLabel.expirationDate)
      : undefined;
  }

  get postageLabelStatus(): PostageLabelStatus {
    if (!this.postageLabel) {
      return PostageLabelStatus.NOT_CREATED;
    }

    if (this.postageLabel.expirationDate) {
      const now = new Date();
      const expiration = new Date(this.postageLabel.expirationDate);

      if (expiration < now) {
        return PostageLabelStatus.EXPIRED;
      }
    }

    return PostageLabelStatus.CREATED;
  }

  get postageLabelPending(): boolean {
    return this.postageLabelStatus === PostageLabelStatus.NOT_CREATED;
  }

  get postageLabelCreated(): boolean {
    return this.postageLabelStatus === PostageLabelStatus.CREATED;
  }

  get postageLabelExpired(): boolean {
    return this.postageLabelStatus === PostageLabelStatus.EXPIRED;
  }

  get deliveryEstimate(): Date | undefined {
    if (
      this.postageLabelStatus !== PostageLabelStatus.CREATED ||
      !this.postageLabelExpiration ||
      !this.shippingValues?.maxDeliveryTime
    ) {
      return undefined;
    }

    const estimate = new Date(this.postageLabelExpiration);
    estimate.setDate(
      estimate.getDate() + this.shippingValues.maxDeliveryTime - 1,
    );

    return estimate;
  }

  get isDeliveryDone(): boolean {
    const doneStatuses = [
      OrderStatus.ORDER_DELIVERED,
      OrderStatus.WAITING_REVIEW,
      OrderStatus.CONCLUDED,
    ];

    return doneStatuses.includes(this.status);
  }

  get deliveryDoneDate(): Date | undefined {
    if (!this.isDeliveryDone || !this.updatedAt) return undefined;

    // procura na historico de status
    if (this.shippingType === AddressOption.INPERSON) {
      const s = this.statusHistory?.find(
        (s) => s.status === OrderStatus.WAITING_REVIEW,
      );
      if (s) return new Date(s.createdAt);
    }

    if (this.shippingType === AddressOption.SHIPPING) {
      const s = this.statusHistory?.find(
        (s) => s.status === OrderStatus.ORDER_DELIVERED,
      );
      if (s) return new Date(s.createdAt);
    }

    return undefined;
  }

  get orderSent(): boolean {
    if (!this.isShipping) return false; // sempre true para retirada
    if (!this.postageLabel) return false; // sem etiqueta

    if (
      [
        OrderStatus.PAYMENT_APPROVED,
        OrderStatus.WAITING_PAYMENT,
        OrderStatus.PAYMENT_FAILED,
        OrderStatus.CANCELED,
        OrderStatus.PAYMENT_REFUNDED,
        OrderStatus.PIX_EXPIRED,
        OrderStatus.WAITING_SHIPMENT,
      ].includes(this.status)
    ) {
      return false; // ainda nao tem informacoes pra mostrar
    }

    return true;
  }

  // Review flow is now gated by `buyerReviewedAt` (order no longer auto-concludes).
  get alreadyReviewedByBuyer(): boolean {
    return !!this.buyerReviewedAt;
  }

  get isCanceled(): boolean {
    return this.status === OrderStatus.CANCELED || !!this.cancellation;
  }
}
