import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { User } from '@trokai/shared-core';
import { ReportUserComponent, ReportUserValue } from '@trokai/shared-ui';
import { ReportUserService } from './report-user.service';

@Component({
  selector: 'app-report-user',
  template: `
    <tk-report-user
      [otherUser]="otherUser"
      [loading]="loading"
      [done]="done"
      (submitted)="sendMessage($event)"
      (closed)="close()"
    />
  `,
  standalone: true,
  imports: [ReportUserComponent],
})
export class ReportUserDialogComponent {
  otherUser: User;
  loading = false;
  done = false;

  private dialogRef = inject(MatDialogRef<ReportUserDialogComponent>);
  private reportUserService = inject(ReportUserService);
  private data = inject<{ otherUser: User }>(MAT_DIALOG_DATA);

  constructor() {
    this.otherUser = this.data?.otherUser;
  }

  async sendMessage(value: ReportUserValue) {
    this.loading = true;
    try {
      await firstValueFrom(
        this.reportUserService.sendMessage(
          this.otherUser._id,
          value.message,
          value.type,
        ),
      );
      this.done = true;
    } finally {
      this.loading = false;
    }
  }

  close() {
    this.dialogRef.close();
  }
}
