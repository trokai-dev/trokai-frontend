import { Component, inject, AfterViewInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sorting-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    FormsModule,
  ],
  templateUrl: './sorting-dialog.component.html',
  styleUrl: './sorting-dialog.component.scss',
})
export class SortingDialogComponent implements AfterViewInit {
  public dialogRef = inject(MatDialogRef<SortingDialogComponent>);
  public data = inject<{ sorting: string }>(MAT_DIALOG_DATA);

  sorting = 'relevance';

  ngAfterViewInit() {
    // avoid expression has changed after it was checked

    setTimeout(() => {
      this.sorting = this.data?.sorting;
    });
  }

  close() {
    this.dialogRef.close();
  }

  applySorting() {
    this.dialogRef.close({ sorting: this.sorting });
  }
}
