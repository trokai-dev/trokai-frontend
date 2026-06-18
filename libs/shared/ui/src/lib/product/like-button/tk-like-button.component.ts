import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FavoritesService } from '@trokai/shared-data-access';

@Component({
  selector: 'tk-like-button',
  standalone: true,
  imports: [NgClass, MatIconModule],
  templateUrl: './tk-like-button.component.html',
  styleUrl: './tk-like-button.component.scss',
})
export class TkLikeButtonComponent {
  @Input() productId!: string;
  @Input() class!: string;

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onFinishLiking = new EventEmitter<void>();

  private tapping = false;
  private touchHandled = false;
  lastAction: number | null = null; // null = nada, 0 = desfavoritou, 1 = favoritou

  private favoritesService = inject(FavoritesService);

  onTouchStart() {
    this.tapping = true;
  }

  onTouchMove() {
    this.tapping = false;
  }

  onTouchEnd(ev: Event) {
    this.touchHandled = true;
    if (this.tapping) this.toggle(ev);
  }

  onClick(ev: Event) {
    ev.stopPropagation();
    if (this.touchHandled) {
      this.touchHandled = false;
      return;
    }
    this.toggle(ev);
  }

  private async toggle(ev: Event) {
    ev.stopPropagation();
    if (!this.productId) return;

    this.lastAction = this.favoriteStatus() ? 0 : 1;
    await this.favoritesService.clickFavorite(this.productId);
    this.lastAction = null;
    this.tapping = false;
    this.onFinishLiking.emit();
  }

  favoriteStatus() {
    if (!this.productId) return false;
    return (
      (this.favoritesService.checkFavorite(this.productId) ||
        this.lastAction === 1) &&
      this.lastAction !== 0
    );
  }
}
