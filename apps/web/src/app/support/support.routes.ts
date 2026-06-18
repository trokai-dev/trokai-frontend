import { Route } from '@angular/router';
import { FaqComponent } from './faq/faq.component';
import { SupportComponent } from './support.component';
import { ContactComponent } from './contact/contact.component';

export default [
  { path: '', component: SupportComponent, data: { clearNav: true } },
  { path: 'faq/:slug', component: FaqComponent, data: { clearNav: true } },
  { path: 'contact', component: ContactComponent, data: { clearNav: true } },
] satisfies Route[];
