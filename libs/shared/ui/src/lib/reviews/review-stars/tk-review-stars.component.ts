import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'tk-review-stars',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './tk-review-stars.component.html',
  styleUrl: './tk-review-stars.component.scss',
})
export class TkReviewStarsComponent {
  @Input() stars = 0;
  @Input() amount: number | null = null;
  @Input() showAmount = true;
  @Input() clickable = false;

  @Output() clicked = new EventEmitter<void>();

  readonly positions = [1, 2, 3, 4, 5];

  onClick(event: Event) {
    event.stopPropagation();
    if (!this.clickable) return;
    this.clicked.emit();
  }

  iconFor(i: number): string {
    const stars = this.stars || 0;
    if (stars >= i) return 'star';
    if (stars >= i - 0.5) return 'star_half';
    return 'star_border';
  }
}
