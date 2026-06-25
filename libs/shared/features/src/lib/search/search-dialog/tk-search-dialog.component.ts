import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarItem } from '@trokai/shared-core';
import {
  SearchRequest,
  TkSearchBarComponent,
} from '../search-bar/tk-search-bar.component';

export interface TkSearchDialogData {
  navMenu: NavbarItem[] | null;
  initialText?: string;
}

/**
 * Thin MatDialog host for the mobile/web "full-page" search surface — same
 * shape as TkFilterDialogComponent. Open with `panelClass: 'dialog-large'`.
 */
@Component({
  selector: 'tk-search-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, TkSearchBarComponent],
  templateUrl: './tk-search-dialog.component.html',
})
export class TkSearchDialogComponent {
  public dialogRef = inject(MatDialogRef<TkSearchDialogComponent>);
  public data = inject<TkSearchDialogData>(MAT_DIALOG_DATA);

  onSearchRequested(request: SearchRequest): void {
    this.dialogRef.close(request);
  }

  onDismiss(): void {
    this.dialogRef.close();
  }
}
