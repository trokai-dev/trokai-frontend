import { BasicModel } from './basic';
import { Brand } from './brands';
import { ClothesStatus } from './clothes-status';

export interface ClothesImage {
  _id: string;
  sm: string;
  md: string;
  lg: string;
}

export class Clothes {
  // properties
  _id?: string;
  /** Server-provided image variants returned by the API with resolveImages=true. */
  images: ClothesImage[];
  /** Legacy field – kept only for backward-compat; prefer `images`. */
  pictures?: { url: string }[];
  /** Legacy field – kept only for backward-compat; prefer `images[0]`. */
  smallPicture?: { url: string };
  title!: string;
  description!: string;
  refund?: boolean;
  condition!: number;
  category!: number;
  gender!: number;
  special!: number;
  piece!: number;
  size!: number;
  cost!: number;
  firstCost?: number;
  age!: number;
  sell: boolean;
  weight!: number;
  declaredValue?: boolean;
  owner?: string;
  // Denormalized owner state (kept in sync server-side for catalog filtering).
  ownerStatus?: number;
  ownerSellerStatus?: string;
  ownerVisibility?: number;
  ownerHealthScore?: number;
  status?: ClothesStatus;
  adjusts: number[];
  adjustsNote!: string;
  questions?: {
    _id: string;
    question: string;
    answer?: string;
    questioner?: string;
  }[];
  copyOf?: string;
  createdAt?: Date;
  updatedAt?: Date;
  brand?: Brand;
  __v!: number;
  reserve?: { reservedBy: string; reservedAt: Date };
  expiresAt?: Date;
  viewCount?: number;
  favoritedCount?: number;
  costHistory?: { cost: number; changedAt: Date }[];
  newImages?: boolean;

  constructor(init?: Partial<Clothes>) {
    this.images = [];
    this.adjusts = [];
    this.sell = false;

    if (init) Object.assign(this, init);
  }

  // methods
  get waitingAdjustment() {
    return this.status === ClothesStatus.WAITING_ADJUSTMENT;
  }

  get waitingPublication() {
    return this.status === ClothesStatus.WAITING_PUBLICATION;
  }

  get reserved() {
    return this.status === ClothesStatus.RESERVED;
  }

  get published() {
    return this.status === ClothesStatus.PUBLISHED;
  }

  get sold() {
    return this.status === ClothesStatus.SOLD;
  }

  get selling() {
    return this.status === ClothesStatus.NEGOTIATING_SELL;
  }

  get expired() {
    return this.status === ClothesStatus.EXPIRED;
  }

  get unavailable() {
    return (
      this.status === ClothesStatus.ANALYSIS_REPROVED ||
      this.status === ClothesStatus.DELETED_BY_USER
    );
  }

  get paused() {
    return this.status === ClothesStatus.PAUSED_BY_USER;
  }

  get statusFormatted() {
    if (this.waitingAdjustment) return 'Requer ajustes';
    if (this.waitingPublication) return 'Em análise';
    if (this.expired) return 'Expirado';
    if (this.sold) return 'Vendido';
    if (this.reserved || this.selling) return 'Reservado';
    if (this.unavailable) return 'Indisponível';
    if (this.paused) return 'Pausado';

    return '';
  }

  get mainImage(): string | undefined {
    return this.images[0]?.md ?? this.smallPicture?.url;
  }

  get thumbnailUrl(): string | undefined {
    return this.images[0]?.sm ?? this.smallPicture?.url;
  }
}
