import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuAccountComponent } from './menu-account/menu-account.component';
import { GlobalService } from '../services/global.service';
import { AuthService } from '../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  standalone: true,
  imports: [MenuAccountComponent, RouterOutlet],
})
export class AccountComponent implements OnInit {
  private globalService = inject(GlobalService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.globalService.setTitle('Minha conta');

    if (isPlatformBrowser(this.platformId)) {
      this.authService.syncUserData(); // Sync user data on component init in the browser
    }
  }
}
