import { AddressOption, Address, User, Clothes } from '@trokai/shared-core';

export { AddressOption } from '@trokai/shared-core';

export enum PaymentOption {
  CREDIT_CARD = 'credit_card',
  PIX = 'pix',
}

export enum UserFeeType {
  BUYER_SERVICE = 'buyerServiceFee',
  BUYER_PROCESSING = 'buyerProcessingFee',
  BUYER_SHIPPING = 'shippingCost',
  BUYER_SHIPPING_REDUCED = 'shippingReducedCost',
}

export enum SellerFeeType {}

export class UserFee {
  value!: number;
  type!: UserFeeType;

  constructor(init?: Partial<UserFee>) {
    if (init) Object.assign(this, init);
  }

  get name() {
    switch (this.type) {
      case UserFeeType.BUYER_SERVICE:
        return 'Taxa de serviço';
      case UserFeeType.BUYER_PROCESSING:
        return 'Taxa de processamento';
      case UserFeeType.BUYER_SHIPPING:
        return 'Frete';
      case UserFeeType.BUYER_SHIPPING_REDUCED:
        return 'Frete promocional';
    }
  }

  get description() {
    switch (this.type) {
      case UserFeeType.BUYER_SERVICE:
        return 'Mantém o Trokaí funcionando, cobrindo os custos da plataforma e garantindo uma boa experiência.';
      case UserFeeType.BUYER_PROCESSING:
        return 'Taxa cobrada pelo serviço de pagamento para processar transações com cartão de crédito.';
      default:
        return null;
    }
  }
}

export class Installment {
  installments!: number;
  installmentValue!: number;
  interest!: number;
  buyerCost!: number;
}

export class ShippingInfo {
  service!: number;
  shippingCost!: number;
  fullShippingCost!: number;
  minDeliveryTime!: number;
  maxDeliveryTime!: number;
}

// Usado para montar o payload *(request)
export class CheckoutLocal {
  products!: Clothes[];
  owner!: User;
  couponCode!: string;
  paymentOption!: PaymentOption;
  cardId?: string;
  shippingOption!: AddressOption;
  selectedInstallments!: number;
  fees!: UserFee[];

  constructor() {
    this.products = [];
  }
}

export class CheckoutValues {
  sumCart!: number;
  couponDiscount?: number;
  pixDiscountPercent?: number;
  fees: UserFee[] = [];
  sumFees!: number;
  pixDiscount?: number;
  totalBeforeDiscounts?: number;
  totalAfterDiscounts?: number;
  installments: Installment[] = [];
  interest?: number;
}

export class CouponDiscounts {
  cartDiscount!: number;
  shippingDiscount?: number;
}

export class CheckoutResponse {
  [key: string]: any;
  inPerson!: {
    creditCard: {
      buyerServiceFee: number;
      buyerProcessingFee: number;
      installments: Installment[];
      clothesCost: number;
      buyerCost: number;
      coupon: CouponDiscounts;
    };
    pix: {
      buyerServiceFee: number;
      clothesCost: number;
      buyerCost: number;
      discount?: number;
      discountPercentage?: number;
      coupon: CouponDiscounts;
    };
  };
  shipping!: {
    shippingValues: ShippingInfo;
    creditCard: {
      buyerServiceFee: number;
      buyerProcessingFee: number;
      installments: Installment[];
      clothesCost: number;
      buyerCost: number;
      coupon: CouponDiscounts;
    };
    pix: {
      buyerServiceFee: number;
      clothesCost: number;
      buyerCost: number;
      discount?: number;
      discountPercentage?: number;
      coupon: CouponDiscounts;
    };
  };

  constructor(init?: Partial<CheckoutResponse>) {
    if (init) Object.assign(this, init);
  }

  getFees(
    shippingOption: AddressOption,
    paymentOption?: PaymentOption,
  ): UserFee[] {
    // fees
    const fees: UserFee[] = [];

    // SHIPPING

    let key = 'inPerson';

    if (shippingOption == AddressOption.SHIPPING) {
      const values = this.shipping.shippingValues;
      let fee = UserFeeType.BUYER_SHIPPING;

      if (
        values.fullShippingCost &&
        values.shippingCost != values.fullShippingCost
      )
        fee = UserFeeType.BUYER_SHIPPING_REDUCED;

      fees.push(
        new UserFee({
          value: values.shippingCost,
          type: fee,
        }),
      );

      key = 'shipping';
    }

    if (paymentOption == null) {
      // if card and pix have the same fees, return already
      if (
        this[key]?.creditCard?.buyerServiceFee ==
        this[key]?.pix?.buyerServiceFee
      )
        fees.push(
          new UserFee({
            value: this[key]?.pix?.buyerServiceFee,
            type: UserFeeType.BUYER_SERVICE,
          }),
        );
    }

    // CREDIT CARD
    if (paymentOption === PaymentOption.CREDIT_CARD) {
      fees.push(
        new UserFee({
          value: this[key].creditCard.buyerServiceFee,
          type: UserFeeType.BUYER_SERVICE,
        }),
      );

      fees.push(
        new UserFee({
          value: this[key].creditCard.buyerProcessingFee,
          type: UserFeeType.BUYER_PROCESSING,
        }),
      );
    }

    if (paymentOption === PaymentOption.PIX) {
      fees.push(
        new UserFee({
          value: this[key].pix.buyerServiceFee,
          type: UserFeeType.BUYER_SERVICE,
        }),
      );
    }

    return fees.filter((f) => f.value != null);
  }

  getInstallments(
    shippingOption: AddressOption,
    paymentOption?: PaymentOption,
  ): Installment[] {
    if (paymentOption === PaymentOption.PIX || paymentOption == null) return [];

    let key = 'inPerson';
    if (shippingOption == AddressOption.SHIPPING) key = 'shipping';

    return this[key].creditCard.installments;
  }

  // use the arg or get available
  private getShippingOption(shippingOption: AddressOption): string {
    let key = this.shipping ? 'shipping' : 'inPerson';

    if (shippingOption == AddressOption.SHIPPING) key = 'shipping';
    else if (shippingOption == AddressOption.INPERSON) key = 'inPerson';

    return key;
  }

  private getPaymentOption(paymentOption: PaymentOption): string {
    let key = 'creditCard';
    if (paymentOption == PaymentOption.PIX) key = 'pix';
    return key;
  }

  getPixDiscount(shippingOption: AddressOption) {
    const key = this.getShippingOption(shippingOption);
    return this[key].pix?.discount;
  }

  getPixDiscountPercentage(shippingOption: AddressOption) {
    const key = this.getShippingOption(shippingOption);
    return this[key].pix?.discountPercentage;
  }

  getCreditCardInterest(shippingOption: AddressOption, installments: number) {
    const key = this.getShippingOption(shippingOption);
    return (
      this[key].creditCard.installments.find(
        (i: Installment) => i.installments === installments,
      )?.interest ?? 0
    );
  }

  getDiscount(
    shippingOption: AddressOption,
    paymentOption: PaymentOption,
  ): number {
    try {
      const shipKey = this.getShippingOption(shippingOption);
      const payKey = this.getPaymentOption(paymentOption);

      const cartDiscount = this[shipKey][payKey]?.coupon?.cartDiscount ?? 0;
      const shippingDiscount =
        this[shipKey][payKey]?.coupon?.shippingDiscount ?? 0;

      return cartDiscount + shippingDiscount;
    } catch {
      return 0;
    }
  }

  getAll(checkoutLocal: CheckoutLocal): CheckoutValues | null {
    if (!checkoutLocal) return null;

    const cv = new CheckoutValues();

    const { shippingOption, paymentOption } = checkoutLocal;

    cv.sumCart = checkoutLocal.products.reduce((a, p) => a + p.cost, 0);
    cv.couponDiscount = this.getDiscount(shippingOption, paymentOption);

    cv.pixDiscountPercent = this.getPixDiscountPercentage(
      checkoutLocal.shippingOption,
    );

    cv.fees = this.getFees(shippingOption, paymentOption) ?? [];
    cv.sumFees = cv.fees?.reduce((acc, fee) => acc + fee.value, 0) ?? 0;

    cv.pixDiscount = 0;

    if (checkoutLocal.paymentOption === PaymentOption.PIX)
      cv.pixDiscount = this.getPixDiscount(checkoutLocal.shippingOption);

    cv.interest =
      paymentOption === PaymentOption.CREDIT_CARD
        ? this.getCreditCardInterest(
            checkoutLocal.shippingOption,
            checkoutLocal.selectedInstallments,
          )
        : 0;

    cv.totalBeforeDiscounts = cv.sumCart + cv.sumFees + (cv.interest ?? 0);
    cv.totalAfterDiscounts =
      cv.totalBeforeDiscounts -
      (cv.couponDiscount ?? 0) -
      (cv.pixDiscount ?? 0);

    if (shippingOption != null)
      cv.installments = this.getInstallments(shippingOption, paymentOption);

    return cv;
  }
}

export class BuyingPayload {
  clothesIds: string[] = [];
  paymentMethod!: PaymentOption;
  shippingType!: AddressOption;
  shippingValues?: {
    service: number;
    shippingCost: number;
  };
  // para cartão de credito
  cardId?: string;
  installments?: number;
  couponCode?: string;
}

export class Coupon {
  _id?: string;
  code!: string;
  description!: string;
  active!: boolean;
  type!: string;
  maxValue!: number;
  minValue!: number;
  expirationDate!: string;
  expirationDateFormatted!: string;
  availableQuantity!: number;
  usedQuantity!: number;
  used?: boolean;
  expired?: boolean;
  valid?: boolean;
  discounts!: {
    shippingDiscountPercentage: number;
    shippingAbsoluteDiscountValue: number;
    feeDiscountPercentage: number;
    absoluteDiscountValue: number;
    percentageDiscountValue: number;
  };

  // Flat partial sent by the coupon endpoint (not a full User document).
  sellerUser?: { _id: string; storeName?: string; avatar?: string };
}

export class Pix {
  encodedImage!: string;
  expirationDate!: Date;
  payload!: string;
  orderId!: string;
}

export class Basket {
  owner: User;
  products: Clothes[];
  lastAction: Date;
  reserved: boolean;

  constructor(owner: User, products: Clothes[], lastAction?: Date) {
    // owner may arrive flat (from /clothes/:id) or restored from storage —
    // normalize so `owner.seller?.*` reads are uniform.
    this.owner = new User(owner);
    this.products = products;
    this.lastAction = lastAction ?? new Date();
    this.reserved = false;
  }

  total() {
    return this.products
      .map((el) => el.cost)
      .reduce((sum, curr) => sum + curr, 0);
  }
}
