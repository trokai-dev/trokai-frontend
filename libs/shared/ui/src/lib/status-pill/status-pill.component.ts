import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Variant drives the pill's color from design tokens — never hardcoded hex.
 * Unifies every "labeled colored status pill" (product status, store visibility,
 * order status, …) into one base. Replaces the duplicated `.product-bullet-status`
 * styles and the `bullet-paused` one-off.
 */
export type StatusPillVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted'
  | 'accent';

@Component({
  selector: 'tk-status-pill',
  standalone: true,
  templateUrl: './status-pill.component.html',
  styleUrls: ['./status-pill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusPillComponent {
  /** Color/semantic variant — resolved to a `--color-*` token in the SCSS. */
  @Input() variant: StatusPillVariant = 'neutral';
  /** Pill text. */
  @Input() label = '';
  /** `overlay` = absolutely positioned (e.g. on a product thumbnail); `inline` = flows inline. */
  @Input() position: 'inline' | 'overlay' = 'inline';
  /** Outlined treatment (transparent bg, colored border + text) — e.g. seller "vacation" badge. */
  @Input() outline = false;
}
