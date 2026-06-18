import { Clothes } from './clothes';
import { User } from './user';

export class HomePayloadRowItem {
  imgUrl?: string;
  imgMobileUrl?: string;
  actionUrl?: string;
  label?: string;
  imgName?: string; // wont upload
  imgMobileName?: string; // wont upload
  route?: string;
  queryParams?: any;
  extras?: unknown;
  objectType: 'banner' | 'generic' | 'ratings' = 'generic';
}

export class HomePayloadRow {
  objectType: 'banner' | 'generic' | 'ratings';
  title?: string;
  description?: string;
  actionUrl?: string;
  route?: string;
  queryParams?: any;
  actionText?: string = 'Ver mais';
  itemsShape?: 'square' | 'circle' = 'square';
  swiper?: boolean = false;
  itemsPerSlide?: number;
  itemsPerSlideMobile?: number;
  itemsType?: 'products' | 'users' | 'midia';
  fromStore?: User | any; // to show items from this store
  itemsFromStore?: Clothes[] | any; // to show items from this store
  showLabels?: boolean = false;
  items?: HomePayloadRowItem[];
  itemsPerRowMobile?: number; // without swiper
  itemMobileWidth?: string; // web
  visibleWeb?: boolean = true;
  visibleApp?: boolean = true; // app
  label?: string;
  extras?: { user?: User; product?: Clothes };
  imgUrl?: string;

  constructor() {
    this.objectType = 'generic';
    this.title = '';
    this.description = '';
    this.actionUrl = '';
    this.actionText = 'Ver mais';
    this.itemsShape = 'square';
    this.swiper = false;
    this.itemsPerSlide = 6;
    this.itemsPerSlideMobile = 2;
    this.itemsType = 'products';

    this.items = [];
    this.itemsPerRowMobile = 2;
  }
}
