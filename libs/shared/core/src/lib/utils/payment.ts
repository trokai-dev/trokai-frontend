import creditCardType from 'credit-card-type';

export enum PaymentBrands {
  PIX = 'pix',
  MASTERCARD = 'mastercard',
  VISA = 'visa',
  ELO = 'elo',
  CARD = 'credit_card',
}

export function getCreditCardBrand(creditCardNumber: string): PaymentBrands {
  if (!creditCardNumber?.trim().length) return PaymentBrands.CARD;

  const result = creditCardType(creditCardNumber);
  switch (result[0]?.type) {
    case 'mastercard': return PaymentBrands.MASTERCARD;
    case 'visa': return PaymentBrands.VISA;
    case 'elo': return PaymentBrands.ELO;
    default: return PaymentBrands.CARD;
  }
}
