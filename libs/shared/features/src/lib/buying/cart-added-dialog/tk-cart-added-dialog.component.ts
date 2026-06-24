import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Basket, CompletingInformationService } from '@trokai/shared-data-access';
import {
  CostPipe,
  TkReviewStarsComponent,
  TkUserAvatarComponent,
} from '@trokai/shared-ui';

export interface CartAddedDialogResult {
  addMore: boolean;
}

/**
 * Shared "item added to sacola" confirmation, opened by `TkProductCtaComponent`
 * right after `BuyingService.addProduct`. Owns the "Ir para pagamento" CTA's
 * buying-rules gate itself via `CompletingInformationService` (platform-agnostic
 * service, safe to call from this shared component). "Adicionar mais produtos"
 * just closes and reports intent — seller navigation differs per platform
 * (web `/users/:nickname` vs app wardrobe page), so that stays with the caller.
 */
@Component({
  selector: 'tk-cart-added-dialog',
  standalone: true,
  imports: [
    CurrencyPipe,
    CostPipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TkUserAvatarComponent,
    TkReviewStarsComponent,
  ],
  templateUrl: './tk-cart-added-dialog.component.html',
  styleUrl: './tk-cart-added-dialog.component.scss',
})
export class TkCartAddedDialogComponent {
  private dialogRef = inject(
    MatDialogRef<TkCartAddedDialogComponent, CartAddedDialogResult>,
  );
  private completingInformation = inject(CompletingInformationService);

  basket = inject<{ basket: Basket }>(MAT_DIALOG_DATA).basket;

  async goToPayment() {
    this.dialogRef.close();
    await this.completingInformation.tryStartPurchase(this.basket.owner._id);
  }

  addMore() {
    this.dialogRef.close({ addMore: true });
  }
}
