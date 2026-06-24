import { User } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { TkSellerStatusBadgeComponent } from '@trokai/shared-ui';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-account',
  templateUrl: './menu-account.component.html',
  styleUrls: ['./menu-account.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatIconModule,
    NgClass,
    RouterLinkActive,
    MatMenuModule,
    RouterLink,
    TkSellerStatusBadgeComponent,
  ],
})
export class MenuAccountComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Output() menuToggle = new EventEmitter();

  menuOppened = false;
  showSellerOptions = false;
  user: User | null = null;

  accountTabs = [
    {
      text: 'Dados pessoais',
      icon: 'person-outline',
      route: 'profile',
    },

    {
      text: 'Cartões',
      icon: 'card-outline',
      route: 'cards',
    },
    {
      text: 'Endereço',
      icon: 'location-outline',
      route: 'address',
    },

    {
      text: 'Segurança',
      icon: 'shield-outline',
      route: 'options',
    },
  ];

  sellerTabs = [
    {
      text: 'Perfil da loja',
      icon: 'storefront-outline',
      route: 'wardrobe',
    },
    {
      text: 'Status da loja',
      icon: 'checkmark-circle-outline',
      route: 'seller-status',
    },
    {
      text: 'Cofrinho',
      icon: 'cash-outline',
      route: 'bank',
    },
  ];

  ngOnInit(): void {
    this.authService.user$.subscribe((user?) => {
      console.log('user', user);
      this.user = user ?? null;
      this.showSellerOptions = user?.isSeller() || false;
      console.log('showSellerOptions', this.showSellerOptions);
    });
  }

  goToSellerStatus() {
    this.router.navigateByUrl('/account/seller-status');
  }

  toggleMenu() {
    this.menuOppened = !this.menuOppened;
    this.menuToggle.emit(this.menuOppened);
  }
}
