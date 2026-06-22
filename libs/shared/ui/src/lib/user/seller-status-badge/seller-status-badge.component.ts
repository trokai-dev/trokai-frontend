import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  SellerProfileStatus,
  SellerStatus,
  StoreVisibility,
  User,
} from '@trokai/shared-core';

@Component({
  selector: 'tk-seller-status-badge',
  templateUrl: './seller-status-badge.component.html',
  styleUrls: ['./seller-status-badge.component.scss'],
  standalone: true,
  imports: [NgClass],
})
export class TkSellerStatusBadgeComponent {
  @Input() user: User | null | undefined;
  @Input() isLoggedUser = false;
  @Output() badgeClick = new EventEmitter<void>();

  get variant(): string {
    if (!this.user) return '';
    if (
      this.user.sellerStatus === SellerStatus.APPROVED &&
      this.user.storeVisibility === StoreVisibility.PAUSED
    )
      return 'vacation';
    if (this.user.sellerProfileStatus === SellerProfileStatus.ADJUSTS_REQUIRED)
      return 'adjusts-required';
    switch (this.user.sellerStatus) {
      case SellerStatus.ONBOARDING:
        return 'onboarding';
      case SellerStatus.APPROVED:
        return 'approved';
      case SellerStatus.REJECTED:
        return 'rejected';
      case SellerStatus.SUSPENDED:
        return 'suspended';
      default:
        return '';
    }
  }

  get label(): string {
    if (!this.user) return '';
    if (
      this.user.sellerStatus === SellerStatus.APPROVED &&
      this.user.storeVisibility === StoreVisibility.PAUSED
    )
      return 'Em pausa';
    if (this.user.sellerProfileStatus === SellerProfileStatus.ADJUSTS_REQUIRED)
      return 'Requer ajustes';
    switch (this.user.sellerStatus) {
      case SellerStatus.ONBOARDING:
        return 'Em cadastro';
      case SellerStatus.APPROVED:
        return 'Ativa';
      case SellerStatus.REJECTED:
        return 'Reprovada';
      case SellerStatus.SUSPENDED:
        return 'Suspensa';
      default:
        return '';
    }
  }

  onClick() {
    if (this.isLoggedUser) this.badgeClick.emit();
  }
}
