export class NavbarLink {
  label!: string;
  route?: string;
  menuIndex?: number;
  queryParams?: Record<string, unknown>;
  expandable?: boolean;
}

export const navbarLinks: NavbarLink[] = [
  {
    label: 'Promoção',
    route: '/search',
    queryParams: {
      sorting: 'relevance',
      promotional: true,
      page: 1,
    },
  },

  {
    label: 'Feminino',
    route: '/search',
    menuIndex: 0,
    expandable: true,
    queryParams: {
      sorting: 'relevance',
      gender: [1],
      page: 1,
    },
  },

  {
    label: 'Masculino',
    route: '/search',
    menuIndex: 1,
    expandable: true,
    queryParams: {
      sorting: 'relevance',
      gender: [0],
      page: 1,
    },
  },
  {
    label: 'Marcas',
    menuIndex: 2,
    expandable: true,
  },
];
