import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '@trokai/shared-core';
import { TkUserAvatarComponent } from '../user-avatar/user-avatar.component';

/**
 * Canonical seller/store identity block: avatar + name + location, with an
 * optional trailing chat button. Reviews, stats and the seller-status badge are
 * projected via <ng-content> so each page keeps its own wiring while sharing one
 * layout. Unifies the former `tk-store-header` (store hero) and `tk-user-header`
 * (order party) into a single component.
 */
@Component({
  selector: 'tk-seller-header',
  templateUrl: './seller-header.component.html',
  styleUrls: ['./seller-header.component.scss'],
  standalone: true,
  imports: [
    TkUserAvatarComponent,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class TkSellerHeaderComponent {
  @Input() user!: User;
  /** `sm` = compact row; `md` = product/order; `lg` = store page hero. */
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';
  /** Render the name as <h1> (store page SEO); otherwise a span. */
  @Input() heading = false;
  /** Whole header acts as a button and emits `clicked`. */
  @Input() clickable = false;
  /** Show the trailing chat icon button. */
  @Input() showChatButton = false;

  @Output() clicked = new EventEmitter<User>();
  @Output() chatClick = new EventEmitter<void>();

  get name(): string {
    return this.user?.storeName ?? this.user?.name ?? '';
  }

  get avatarSize(): 'small' | 'medium' | 'large' {
    if (this.size === 'lg') return 'large';
    if (this.size === 'sm') return 'small';
    return 'medium';
  }

  onClick() {
    if (this.clickable) this.clicked.emit(this.user);
  }
}
