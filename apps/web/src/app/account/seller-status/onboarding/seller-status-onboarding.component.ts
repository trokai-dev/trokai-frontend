import { SellerProfileStatus, User } from '@trokai/shared-core';
import { ClothesStatus } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  inject,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CompletingInformationService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-seller-status-onboarding',
  templateUrl: './seller-status-onboarding.component.html',
  styleUrls: ['./seller-status-onboarding.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NgClass, MatButtonModule, RouterLink],
})
export class SellerStatusOnboardingComponent {
  private completingInformationService = inject(CompletingInformationService);
  private router = inject(Router);

  @Input() user!: User;
  @Input() minClothesToSell = 5;

  readonly SellerProfileStatus = SellerProfileStatus;
  readonly ClothesStatus = ClothesStatus;

  get publishedCount(): number {
    return (
      this.user?.clothesSummary?.find(
        (s) => s.status === ClothesStatus.PUBLISHED,
      )?.count ?? 0
    );
  }

  get pendingCount(): number {
    return (
      this.user?.clothesSummary?.find(
        (s) => s.status === ClothesStatus.WAITING_PUBLICATION,
      )?.count ?? 0
    );
  }

  get adjustsCount(): number {
    return (
      this.user?.clothesSummary?.find(
        (s) => s.status === ClothesStatus.WAITING_ADJUSTMENT,
      )?.count ?? 0
    );
  }

  get reprovedCount(): number {
    return (
      this.user?.clothesSummary?.find(
        (s) => s.status === ClothesStatus.ANALYSIS_REPROVED,
      )?.count ?? 0
    );
  }

  get showClothesProgress(): boolean {
    return true;
  }

  get progressPercent(): number {
    return Math.min((this.publishedCount / this.minClothesToSell) * 100, 100);
  }

  get profileStatusVariant(): string {
    switch (this.user?.sellerProfileStatus) {
      case SellerProfileStatus.PENDING_REVIEW:
        return 'pending-review';
      case SellerProfileStatus.ADJUSTS_REQUIRED:
        return 'adjusts-required';
      case SellerProfileStatus.APPROVED:
        return 'profile-approved';
      case SellerProfileStatus.INCOMPLETE:
      default:
        return 'incomplete';
    }
  }

  get showAddProductsCta(): boolean {
    return (
      !this.user?.minClothesApproved &&
      this.pendingCount < this.minClothesToSell
    );
  }

  async goAddProducts(): Promise<void> {
    if (this.user?.sellerProfileStatus === SellerProfileStatus.INCOMPLETE) {
      await this.completingInformationService.canRegisterProduct();
    } else {
      this.router.navigateByUrl('/sell');
    }
  }
}
