import { Component, inject } from '@angular/core';

import { environment } from 'src/environments/environment';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-open-app-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './open-app-dialog.component.html',
  styleUrl: './open-app-dialog.component.scss',
})
export class OpenAppDialogComponent {
  public data = inject<{ appRoute: string }>(MAT_DIALOG_DATA);
  public dialogRef = inject(MatDialogRef<OpenAppDialogComponent>);

  openApp() {
    const appScheme = `${environment.appCustomScheme}${this.data.appRoute}`;

    const fallbackUrl = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? environment.appStoreLink
      : environment.googlePlayLink;

    const timeout = setTimeout(() => {
      window.location.href = fallbackUrl;
    }, 1000); // Time to wait before redirecting to the app store

    window.location.href = appScheme;

    // Clear timeout if the app opens successfully
    window.addEventListener('blur', () => clearTimeout(timeout));

    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
