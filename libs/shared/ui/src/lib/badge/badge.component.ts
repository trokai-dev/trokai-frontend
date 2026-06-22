import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Count bubble overlaid on the top-right of projected content (avatar, icon...).
 * Shared across web + app to avoid per-call badge markup.
 */
@Component({
  selector: 'tk-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class TkBadgeComponent {
  @Input() count = 0;
  @Input() max = 99;

  get display(): string {
    return this.count > this.max ? `${this.max}+` : `${this.count}`;
  }
}
