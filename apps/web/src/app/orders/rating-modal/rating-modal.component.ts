import { Order, User } from '@trokai/shared-core';
import { Component, OnInit, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { TkRatingFormComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-rating-modal',
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.scss'],
  standalone: true,
  imports: [MatDialogModule, TkRatingFormComponent],
})
export class RatingFormComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<RatingFormComponent>);
  public data = inject<{ order: Order; otherUser: User }>(MAT_DIALOG_DATA);
  private authService = inject(AuthService);

  isSale = false;

  ngOnInit() {
    const user = this.authService.getUserValue();
    this.isSale = this.data.order?.seller?.['_id'] === user?._id;
  }

  close(didReview?: boolean) {
    this.dialogRef.close({ didReview });
  }
}
