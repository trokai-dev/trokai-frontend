import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StoreVisibility, User } from '@trokai/shared-core';
import { TkUserAvatarComponent } from '../user-avatar/user-avatar.component';
import { TkSellerStatusBadgeComponent } from '../seller-status-badge/seller-status-badge.component';

@Component({
  selector: 'tk-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss'],
  standalone: true,
  imports: [TkUserAvatarComponent, TkSellerStatusBadgeComponent, MatIconModule, MatButtonModule, MatTooltipModule],
})
export class TkUserHeaderComponent {
  @Input() user!: User;
  @Input() layout: 'row' | 'card' = 'row';
  @Input() showChatButton = false;
  @Input() canOpenProfile = true;
  @Input() isLoggedUser = false;
  @Output() clicked = new EventEmitter<User>();
  @Output() chatClick = new EventEmitter<void>();
  @Output() sellerBadgeClick = new EventEmitter<void>();

  readonly storeVisibility = StoreVisibility;

  onClick() {
    if (this.canOpenProfile) this.clicked.emit(this.user);
  }
}
