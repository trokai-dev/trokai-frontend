/**
 * Navbar menu item. Web-canonical superset — optional fields cover the app's
 * leaner subset (it omits route/params).
 */
export class NavbarItem {
  label!: string;
  type!: string;
  gender?: number | number[];
  params?: any;
  route?: string;
  cols!: {
    label?: string;
    category?: string;
    gender?: number;
    list: any[];
    route?: string;
    params?: any;
  }[];
}
