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
  REJECTED = 'REJECTED', // Perfil rejeitado pelo admin
}

export enum SellerHealthStatus {
  INCUBATING = 'INCUBATING',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  ATTENTION = 'ATTENTION',
  CRITICAL = 'CRITICAL',
}

export interface SellerHealthMetrics {
  cancelRate?: number | null;
  reviewsAvg?: number | null;
  avgShippingDays?: number | null;
  avgClothesRelevance?: number | null;
  questionResponseRate?: number | null;
  avgQuestionResponseHours?: number | null;
}

export class SellerHealth {
  score?: number | null;
  status?: SellerHealthStatus;
  metrics?: SellerHealthMetrics;
  updatedAt?: Date;
  reviewsAverage?: number;
  reviewsAmount?: number;
  avgPostageDays?: number;
  salesCount?: number;
  faultCancellationsCount?: number;
  productsSold?: number;
  productsForSale?: number;
  clothesSummary?: {
    status: ClothesStatus;
    count: number;
  }[];

  constructor(init?: Partial<SellerHealth>) {
    Object.assign(this, init);
  }
}

export class Seller {
  status?: SellerStatus;
  profileStatus?: SellerProfileStatus;
  storeName?: string;
  nickname?: string;
  shipping?: boolean;
  inPerson?: boolean;
  storeVisibility?: StoreVisibility;
  profileBio?: string;
  adjusts?: number[];
  adjustsNote?: string;
  minClothesApproved?: boolean;
  brechoStatus?: string;
  hideFromHome?: boolean;
  reviews?: UserReview[];
  health?: SellerHealth;

  constructor(init?: Partial<Seller>) {
    Object.assign(this, init);
    this.health = new SellerHealth(init?.health);
  }
}

export class User {
  avatar!: string;
  email!: string;
  name!: string;
  cpf!: string;
  birthday!: Date;
  phone!: string;
  _id!: string;
  token!: string;
  rating!: string;
  googleId!: string;
  googleAvatar!: string;
  address!: Address;
  cards!: Card[];
  status!: number;
  phoneVerified!: boolean;
  blockedUsers?: string[];

  // Seller account — nested namespace mirroring the backend `seller.*` schema.
  // Always populated by this constructor; optional for plain-cast payloads.
  seller?: Seller;

  // check these
  pagarMeRecipientStatus?: PagarMeRecipientStatus;
  pagarMeKycDetailsStatus?: PagarMeKycDetailsStatus;

  constructor(init?: Partial<User>) {
    Object.assign(this, init);

    // The backend returns the seller namespace in several shapes:
    // - GET /users/me     -> fully nested `seller.*` / `seller.health.*`
    // - GET /users/:id    -> seller core nested, health stats copied to root
    // - GET /clothes/:id  -> seller core + stats FLATTENED to root
    // - coupon / top-sellers -> a few flat seller fields
    // Normalize all of them into the canonical nested `seller` so every reader
    // uses `user.seller?.*` / `user.seller?.health?.*`. `??` keeps nested when
    // both are present, so already-nested payloads pass through unchanged.
    const src = (init ?? {}) as Record<string, unknown>;
    const g = <T>(k: string) => src[k] as T | undefined;

    this.seller = new Seller(src['seller'] as Partial<Seller> | undefined);
    const s = this.seller;

    s.storeName ??= g<string>('storeName');
    s.nickname ??= g<string>('nickname');
    s.shipping ??= g<boolean>('shipping');
    s.inPerson ??= g<boolean>('inPerson');
    s.storeVisibility ??= g<StoreVisibility>('storeVisibility');
    s.profileBio ??= g<string>('profileBio');
    s.hideFromHome ??= g<boolean>('hideFromHome');
    s.brechoStatus ??= g<string>('brechoStatus');
    s.minClothesApproved ??= g<boolean>('minClothesApproved');
    s.reviews ??= g<UserReview[]>('reviews');
    // legacy flat seller-status names (older payloads / cached sessions)
    s.status ??= g<SellerStatus>('sellerStatus');
    s.profileStatus ??= g<SellerProfileStatus>('sellerProfileStatus');
    s.adjusts ??= g<number[]>('sellerAdjusts');
    s.adjustsNote ??= g<string>('sellerAdjustsNote');

    const h = s.health as SellerHealth;
    h.reviewsAverage ??= g<number>('reviewsAverage');
    h.productsSold ??= g<number>('productsSold');
    h.productsForSale ??= g<number>('productsForSale');
    h.avgPostageDays ??= g<number>('avgPostageDays');
    h.salesCount ??= g<number>('salesCount');
    h.clothesSummary ??= g<{ status: ClothesStatus; count: number }[]>(
      'clothesSummary',
    );
    h.reviewsAmount ??= g<number>('reviewsAmount') ?? s.reviews?.length;
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
        (this.seller?.inPerson || this.seller?.shipping) &&
        this.avatar != null &&
        this.seller?.storeName != null,

      sellerStatus: this.seller?.status,
      phoneVerified: this.phoneVerified,
      minClothesApproved: this.seller?.minClothesApproved,
    };
  }

  isSeller() {
    return this.seller?.status != null;
  }

  get displayAvatar(): string | undefined {
    return this.avatar ?? this.googleAvatar ?? undefined;
  }

  get displayName(): string {
    return this.seller?.storeName || this.name;
  }
}
