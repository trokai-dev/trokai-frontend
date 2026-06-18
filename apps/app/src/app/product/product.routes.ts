import { Route } from '@angular/router';
import { ProductPage } from './product.page';

export default [
  {
    path: '',
    component: ProductPage,
  },
  {
    path: 'question',
    loadComponent: () =>
      import('./questions-page/questions-page.page').then(
        (m) => m.QuestionsPage,
      ),
  },
  {
    path: 'question/:question_id',
    loadComponent: () =>
      import('./questions-page/questions-page.page').then(
        (m) => m.QuestionsPage,
      ),
  },
] satisfies Route[];
