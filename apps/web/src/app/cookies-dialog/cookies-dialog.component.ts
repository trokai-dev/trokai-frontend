import { Component, EventEmitter, Output, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { StorageService } from '@trokai/shared-core';

@Component({
  selector: 'app-cookies-dialog',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './cookies-dialog.component.html',
  styleUrl: './cookies-dialog.component.scss',
})
export class CookiesDialogComponent {
  private storage = inject(StorageService);

  @Output() accepted = new EventEmitter();

  async accept() {
    await this.storage.set('accepted_cookies', 'true');
    this.accepted.emit();
  }
}
