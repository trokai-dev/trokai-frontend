import { AfterViewInit, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Filters } from '@trokai/shared-core';
import { TkFilterFormComponent } from '../filter-form/tk-filter-form.component';

/**
 * Shared MatDialog wrapper around the filter content. Both web and app open it
 * via MatDialog (the app no longer uses Ionic ModalController). itemsMap is
 * resolved inside TkFilterFormComponent from the shared CatalogService, so
 * callers only pass `{ filter }` and read back `{ filter }`.
 */
@Component({
  selector: 'tk-filter-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TkFilterFormComponent,
  ],
  templateUrl: './tk-filter-dialog.component.html',
  styleUrl: './tk-filter-dialog.component.scss',
})
export class TkFilterDialogComponent implements AfterViewInit {
  public dialogRef = inject(MatDialogRef<TkFilterDialogComponent>);
  public data = inject<{ filter: Filters }>(MAT_DIALOG_DATA);

  filter!: Filters;

  ngAfterViewInit() {
    // avoid expression has changed after it was checked
    setTimeout(() => {
      this.filter = this.data?.filter
        ? new Filters(this.data.filter)
        : new Filters();
    });
  }

  applyFilters(filter: Filters) {
    this.dialogRef.close({ filter });
  }

  clearFilters() {
    this.dialogRef.close({ filter: new Filters() });
  }
}
