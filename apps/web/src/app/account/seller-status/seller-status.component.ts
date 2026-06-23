import { SellerStatus, StoreVisibility, User } from '@trokai/shared-core';
import { ClothesStatus } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { GlobalService } from '../../services/global.service';
import { TkSellerStatusBadgeComponent } from '@trokai/shared-ui';
import { SellerStatusOnboardingComponent } from './onboarding/seller-status-onboarding.component';
import { AlertService } from '@trokai/shared-ui';
import { TkReviewStarsComponent } from '@trokai/shared-ui';
import { DialogService } from '../../services/dialog.service';
import { MatDividerModule } from '@angular/material/divider';
import { SellerHealthComponent } from './seller-health/seller-health.component';

@Component({
  selector: 'app-seller-status',
  templateUrl: './seller-status.component.html',
  styleUrls: ['./seller-status.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    NgClass,
    TkSellerStatusBadgeComponent,
    SellerStatusOnboardingComponent,
    TkReviewStarsComponent,
    MatDividerModule,
    SellerHealthComponent,
  ],
})
export class SellerStatusComponent implements OnInit {
  private authService = inject(AuthService);
  private alert = inject(AlertService);
  private globalService = inject(GlobalService);
  private dialogService = inject(DialogService);

  user: User | null = null;
  minClothesToSell = 5;
  savingVisibility = false;

  readonly SellerStatus = SellerStatus;
  readonly StoreVisibility = StoreVisibility;

  readonly allStatuses: { status: ClothesStatus; label: string }[] = [
    { status: ClothesStatus.PUBLISHED, label: 'Disponíveis' },
    { status: ClothesStatus.RESERVED, label: 'Reservados' },
    { status: ClothesStatus.NEGOTIATING_SELL, label: 'Em negociação' },
    { status: ClothesStatus.SOLD, label: 'Vendidos' },
    { status: ClothesStatus.PAUSED_BY_USER, label: 'Pausados' },
    { status: ClothesStatus.WAITING_PUBLICATION, label: 'Em análise' },
    { status: ClothesStatus.WAITING_ADJUSTMENT, label: 'Requer ajustes' },
    { status: ClothesStatus.EXPIRED, label: 'Expirados' },
    { status: ClothesStatus.ANALYSIS_REPROVED, label: 'Reprovados' },
    { status: ClothesStatus.DELETED_BY_USER, label: 'Deletados' },
  ];

  getStatusCount(status: ClothesStatus): number {
    return (
      this.user?.seller?.health?.clothesSummary?.find((s) => s.status === status)
        ?.count ?? 0
    );
  }

  openReviews(store: User) {
    if (!store?.seller?.health?.reviewsAmount) return;
    this.dialogService.openUserReviews(store);
  }

  ngOnInit(): void {
    this.authService.user.subscribe((user) => {
      this.user = user ?? null;
    });
    this.globalService.params.subscribe((params) => {
      if (params) this.minClothesToSell = params.minClothesToSell || 5;
    });
  }

  async setVisibility(v: StoreVisibility): Promise<void> {
    const title =
      v === StoreVisibility.OPEN ? 'Retomar vendas' : 'Pausar vendas';

    const message =
      v === StoreVisibility.OPEN
        ? 'Seus anúncios estarão visíveis para todos. Deseja continuar?'
        : 'Sua loja ficará pausada e seus anúncios não serão exibidos no Trokaí. Deseja continuar?';

    const proceed = await this.alert.question(
      message,
      title,
      'Continuar',
      'Cancelar',
    );

    if (
      !proceed ||
      this.savingVisibility ||
      this.user?.seller?.storeVisibility === v
    ) {
      return;
    }

    this.savingVisibility = true;

    try {
      await this.authService.updateUser({ storeVisibility: v });
    } finally {
      this.savingVisibility = false;
    }
  }
}
