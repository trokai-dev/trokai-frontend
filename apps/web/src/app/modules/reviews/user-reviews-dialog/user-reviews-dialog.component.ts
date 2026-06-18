import { User } from '@trokai/shared-core';
import { Component, OnInit, inject } from '@angular/core';
import { ReviewModel } from '@trokai/shared-data-access';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { SearchService } from 'src/app/search/search.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TkReviewsListComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-user-reviews-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    TkReviewsListComponent,
  ],
  templateUrl: './user-reviews-dialog.component.html',
  styleUrl: './user-reviews-dialog.component.scss',
})
export class UserReviewsDialogComponent implements OnInit {
  private searchService = inject(SearchService);
  private dialogRef =
    inject<MatDialogRef<UserReviewsDialogComponent>>(MatDialogRef);
  data = inject<{ user: User }>(MAT_DIALOG_DATA);

  reviews?: ReviewModel[];
  user?: User;

  ngOnInit() {
    if (!this.data.user._id) {
      this.close();
      return;
    }

    this.user = this.data.user;
    this.load();
  }

  private async load() {
    if (!this.user) return;

    const reviews = (await this.searchService.getUserReviews(
      this.user._id,
    )) as ReviewModel[];

    this.reviews = (reviews ?? []).sort((a, b) =>
      (a.createdAt?.getTime() ?? 0) < (b.createdAt?.getTime() ?? 0) ? 1 : -1,
    );
  }

  close(didReview?: boolean) {
    this.dialogRef.close({
      didReview: didReview,
    });
  }
}
