import { AfterViewInit, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SearchFilterComponent } from '../search-filter/search-filter.component';
import { Filters } from '@trokai/shared-core';

@Component({
  selector: 'app-filter-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SearchFilterComponent,
  ],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.scss',
})
export class FilterDialogComponent implements AfterViewInit {
  public dialogRef = inject(MatDialogRef<FilterDialogComponent>);
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
    this.dialogRef.close({ filter: filter });
  }

  clearFilters() {
    this.dialogRef.close({ filter: new Filters() });
  }
}
