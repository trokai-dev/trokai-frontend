import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReviewModel } from '@trokai/shared-data-access';
import { TkUserAvatarComponent } from '../../user/user-avatar/user-avatar.component';
import { TkReviewStarsComponent } from '../review-stars/tk-review-stars.component';

@Component({
  selector: 'tk-review-card',
  standalone: true,
  imports: [DatePipe, TkUserAvatarComponent, TkReviewStarsComponent],
  templateUrl: './tk-review-card.component.html',
  styleUrl: './tk-review-card.component.scss',
})
export class TkReviewCardComponent {
  @Input() review!: ReviewModel;
}
