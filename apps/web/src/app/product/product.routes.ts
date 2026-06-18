import { Route } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { ProductComponent } from './product.component';
import { QuestionsPageComponent } from './questions-page/questions-page.component';

export default [
  {
    path: ':product_title_id',
    component: ProductComponent,
    pathMatch: 'full',
    data: { showSearch: true },
  },
  {
    path: ':product_title_id/question',
    component: QuestionsPageComponent,
    pathMatch: 'full',
    data: { clearNav: true },
    canActivate: [AuthGuard],
  },
  {
    path: ':product_title_id/question/:question_id',
    component: QuestionsPageComponent,
    pathMatch: 'full',
    data: { clearNav: true },
  },
] satisfies Route[];
