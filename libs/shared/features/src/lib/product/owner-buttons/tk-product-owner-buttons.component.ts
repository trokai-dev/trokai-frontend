import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clothes, ClothesStatus } from '@trokai/shared-core';

/**
 * Explicit owner action buttons for the product page (canonical web UX). Replaces
 * the app's hidden ActionSheet. Pure presentational: status drives which buttons
 * show; the host product page wires each @Output() to its own action method
 * (navigation, inventory calls, dialogs) per platform.
 */
@Component({
  selector: 'tk-product-owner-buttons',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './tk-product-owner-buttons.component.html',
  styleUrl: './tk-product-owner-buttons.component.scss',
})
export class TkProductOwnerButtonsComponent implements OnChanges {
  @Input({ required: true }) product!: Clothes;
  @Input() myProduct = false;
  @Input() showRenew = false;

  @Output() edit = new EventEmitter<void>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() deactivate = new EventEmitter<void>();
  @Output() activate = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();
  @Output() renew = new EventEmitter<void>();
  @Output() correct = new EventEmitter<void>();

  published = false;
  paused = false;
  waitingPublication = false;
  waitingAdjustment = false;
  expired = false;
  unavailable = false;
  sold = false;

  ngOnChanges(): void {
    const s = this.product?.status;
    this.published = s === ClothesStatus.PUBLISHED;
    this.paused = s === ClothesStatus.PAUSED_BY_USER;
    this.waitingPublication = s === ClothesStatus.WAITING_PUBLICATION;
    this.waitingAdjustment = s === ClothesStatus.WAITING_ADJUSTMENT;
    this.expired = s === ClothesStatus.EXPIRED;
    this.unavailable =
      s === ClothesStatus.ANALYSIS_REPROVED ||
      s === ClothesStatus.DELETED_BY_USER;
    this.sold = s === ClothesStatus.SOLD;
  }

  get showEditGroup(): boolean {
    return (
      this.myProduct &&
      (this.published ||
        this.waitingPublication ||
        this.paused ||
        this.waitingAdjustment ||
        this.showRenew)
    );
  }
}
