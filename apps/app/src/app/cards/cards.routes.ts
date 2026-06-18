export default [
  {
    path: '',
    loadComponent: () => import('./cards.page').then((m) => m.CardsPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../buying/new-card/new-card.page').then((m) => m.NewCardPage),
  },
];
