import { Component, inject } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StorageService } from '@trokai/shared-core';

export const QUESTIONS_SECURITY_DIALOG_AGREED_KEY =
  'questions_security_dialog_agreed';

@Component({
  selector: 'tk-questions-security-dialog',
  standalone: true,
  imports: [FormsModule, MatCheckboxModule, MatButtonModule, MatIconModule],
  templateUrl: './tk-questions-security-dialog.component.html',
  styleUrl: './tk-questions-security-dialog.component.scss',
})
export class TkQuestionsSecurityDialogComponent {
  private dialogData = inject<{ seller?: boolean }>(MAT_DIALOG_DATA);
  seller = this.dialogData?.seller ?? true;
  agreed = false;

  private dialogRef = inject(MatDialogRef<TkQuestionsSecurityDialogComponent>);
  private storage = inject(StorageService);

  async onConfirm() {
    if (!this.agreed) return;
    await this.storage.set(QUESTIONS_SECURITY_DIALOG_AGREED_KEY, 'true');
    this.dialogRef.close(true);
  }
}
