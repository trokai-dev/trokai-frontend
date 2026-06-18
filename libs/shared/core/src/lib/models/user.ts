import { ClothesStatus } from './clothes-status';
import { UserReview } from './review';

export class Address {
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: number;
  number?: number;
  complement?: string;
  country?: string;
  location?: {
    coordinates: number[];
  };
}

export class Card {
  _id?: string;
  number!: number;
  holderName!: string;
  holderDocument!: string;
  cvv!: number;
  address!: Address;
  token?: string;
  lastDigits?: number;
  expMonth!: number;
  expYear!: number;
  brand?: string;
}

export enum StoreVisibility {
  OPEN = 1,
  PAUSED = 2,
}

export enum PagarMeRecipientStatus {
  ACTIVE = 'active',
  AFFILIATION = 'affiliation',
  REFUSED = 'refused',
}

export enum PagarMeKycDetailsStatus {
  PARTIALLY_DENIED = 'partially_denied',
  PENDING = 'pending',
}

export enum SellerStatus {
  ONBOARDING = 'ONBOARDING', // Conta em processo de onboarding (perfil incompleto, em análise ou com ajustes)
  REJECTED = 'REJECTED', // Rejected by Admin
  APPROVED = 'APPROVED', // Approved by Admin (requires sellerProfileStatus=APPROVED AND minClothesApproved=true)
  SUSPENDED = 'SUSPENDED', // Suspended by Admin
}

export enum SellerProfileStatus {
  INCOMPLETE = 'INCOMPLETE', // Cadastro ainda não finalizado
  PENDING_REVIEW = 'PENDING_REVIEW', // Aguardando revisão pelo admin
  ADJUSTS_REQUIRED = 'ADJUSTS_REQUIRED', // Admin solicitou ajustes
  APPROVED = 'APPROVED', // Perfil aprovado pelo admin
}

export class User {
  avatar!: string;
  email!: string;
  name!: string;
  storeName!: string;
  nickname!: string;
  cpf!: string;
  birthday!: Date;
  phone!: string;
  _id!: string;
  token!: string;
  rating!: string;
  googleId!: string;
  googleAvatar!: string;
  address!: Address;
  shipping!: boolean;
  inPerson!: boolean;
  cards!: Card[];
  reviewsAverage!: number;
  reviewsAmount?: number;
  reviews?: UserReview[];
  status!: number;
  phoneVerified!: boolean;
  storeVisibility!: StoreVisibility;
  clothesSummary?: {
    status: ClothesStatus;
    count: number;
  }[];
  blockedUsers?: string[];
  hideFromHome?: boolean;
  productsSold?: number;
  productsForSale?: number;
  salesCount?: number;
  avgPostageDays?: number;
  sellerStatus?: SellerStatus;
  sellerProfileStatus?: SellerProfileStatus;
  sellerAdjusts?: number[];
  sellerAdjustsNote?: string;
  minClothesApproved?: number;
  profileBio?: string;

  // check these
  pagarMeRecipientStatus?: PagarMeRecipientStatus;
  pagarMeKycDetailsStatus?: PagarMeKycDetailsStatus;

  constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }

  accountCompletion() {
    return {
      // common for all users
      address:
        this.address != null &&
        this.address.street != null &&
        this.address.number != null,

      personalInfo:
        this.cpf != null && this.birthday != null && this.phone != null,

      // seller only
      sellerInfo:
        (this.inPerson || this.shipping) &&
        this.avatar != null &&
        this.storeName != null,

      sellerStatus: this.sellerStatus,
      phoneVerified: this.phoneVerified,
      minClothesApproved: this.minClothesApproved,
    };
  }

  isSeller() {
    return this.sellerStatus != null;
  }

  get displayAvatar(): string | undefined {
    return this.avatar ?? this.googleAvatar ?? undefined;
  }

  get displayName(): string {
    return this.storeName || this.name;
  }
}
