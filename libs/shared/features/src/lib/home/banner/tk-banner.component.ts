import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HideLoadingImageDirective } from '@trokai/shared-ui';
import { HomePayloadRowItem } from '@trokai/shared-core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

/**
 * Home banner (canonical web markup: responsive desktop/mobile, SEO links,
 * NgOptimizedImage). `useLink=false` renders the app's tap-to-navigate variant
 * and emits `(navigate)`.
 */
@Component({
  selector: 'tk-banner',
  templateUrl: './tk-banner.component.html',
  styleUrl: './tk-banner.component.scss',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, HideLoadingImageDirective],
})
export class TkBannerComponent {
  @Input() item!: HomePayloadRowItem;
  @Input() viewportHeight = 0;
  @Input() priority = false;
  /** Web: navigate via the rendered `routerLink`/`href`. App: false → emit `(navigate)`. */
  @Input() useLink = true;

  @Output() navigate = new EventEmitter<void>();
}
