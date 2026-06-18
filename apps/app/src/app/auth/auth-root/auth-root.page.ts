import { Component } from '@angular/core';
import { AuthPage } from '../auth.page';
import { IonNav } from '@ionic/angular/standalone';

@Component({
  selector: 'app-auth-root',
  templateUrl: './auth-root.page.html',
  styleUrls: ['./auth-root.page.scss'],
  standalone: true,
  imports: [IonNav],
})
export class AuthRootPage {
  rootPage = AuthPage;
}
