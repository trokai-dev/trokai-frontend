import { Address } from '@trokai/shared-core';
import creditCardType from 'credit-card-type';

export enum PaymentBrands {
  PIX = 'pix',
  MASTERCARD = 'mastercard',
  VISA = 'visa',
  ELO = 'elo',
  CARD = 'credit_card',
}

export function getCreditCardBrand(creditCardNumber: string): PaymentBrands {
  if (!creditCardNumber || !creditCardNumber.trim().length) {
    return PaymentBrands.CARD; // Retorna CARD se o número do cartão for inválido ou vazio
  }

  const creditCardTypeResult = creditCardType(creditCardNumber);
  const type = creditCardTypeResult[0]?.type;
  switch (type) {
    case 'mastercard':
      return PaymentBrands.MASTERCARD;
    case 'visa':
      return PaymentBrands.VISA;
    case 'elo':
      return PaymentBrands.ELO;
    default:
      return PaymentBrands.CARD;
  }
}

export function equalAddresses(address1: Address, address2: Address) {
  return (
    address1?.street === address2?.street &&
    address1?.number === address2?.number &&
    address1?.complement === address2?.complement &&
    address1?.neighborhood === address2?.neighborhood &&
    address1?.city === address2?.city &&
    address1?.state === address2?.state &&
    address1?.zipCode === address2?.zipCode
  );
}
