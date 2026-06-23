import { HideLoadingImageDirective } from '@trokai/shared-ui';
import { Component, Input } from '@angular/core';
import { HomePayloadRowItem } from '@trokai/shared-core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, HideLoadingImageDirective],
})
export class BannerComponent {
  @Input() item!: HomePayloadRowItem;
  @Input() viewportHeight = 0;
  @Input() priority = false;
}
