export enum TransferStatus {
  PENDING,
  BANK_PROCESSING,
  DONE,
  CANCELLED,
  FAILED,
}

export class BankAccountHolderType {
  static INDIVIDUAL = 'individual';
  static COMPANY = 'company';
}

export class BankAccountModel {
  holderName!: string;
  holderType!: string;
  holderDocument!: string;
  bank?: string;
  branchNumber!: string;
  branchCheckDigit!: string;
  accountNumber!: string;
  accountCheckDigit!: string;
}

export class BalanceModel {
  saldoDisponivel!: number;
  totalJaVendido!: number;
  vendasEmAndamento!: number;
  orders!: {
    _id: string;
    items: [
      {
        clothesId: string;
        amount: number;
        weight: number;
        description: string;
        quantity: 1;
        _id: string;
        refund?: boolean; // app superset
      },
    ];
    sellerProfit: number;
    status: number;
    transferAt?: Date;
    createdAt: Date;
  }[];
  transfers!: {
    _id: string;
    amount: number;
    fee: number;
    ordersIds: string[];
    status: TransferStatus;
    createdAt: Date;
  }[];
}
