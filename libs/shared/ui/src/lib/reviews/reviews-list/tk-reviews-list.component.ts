import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { User } from '@trokai/shared-core';
import { ReviewModel } from '@trokai/shared-data-access';
import { TkUserAvatarComponent } from '../../user/user-avatar/user-avatar.component';
import { TkReviewStarsComponent } from '../review-stars/tk-review-stars.component';
import { TkReviewCardComponent } from '../review-card/tk-review-card.component';

@Component({
  selector: 'tk-reviews-list',
  standalone: true,
  imports: [
    DecimalPipe,
    MatIconModule,
    TkUserAvatarComponent,
    TkReviewStarsComponent,
    TkReviewCardComponent,
  ],
  templateUrl: './tk-reviews-list.component.html',
  styleUrl: './tk-reviews-list.component.scss',
})
export class TkReviewsListComponent {
  @Input() user!: User;
  @Input() reviews: ReviewModel[] | null = null;
}
