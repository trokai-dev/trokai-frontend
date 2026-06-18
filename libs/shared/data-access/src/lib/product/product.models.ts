export class ClothesPayment {
  pix!: {
    buyerCost: number;
    pixDiscountPercentage: number;
  };
  creditCard!: {
    maxNoInterest: {
      installments: number;
      installmentValue: number;
      buyerCost: number;
    };
    maxInstallments: {
      installments: number;
      installmentValue: number;
      buyerCost: number;
    };
  };
}
