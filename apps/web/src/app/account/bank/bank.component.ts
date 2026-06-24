import { Component, inject } from '@angular/core';
import { TkBankComponent } from '@trokai/shared-features';
import { BrowserRef } from '../../services/browser-ref.service';

@Component({
  selector: 'app-bank',
  standalone: true,
  imports: [TkBankComponent],
  template: `<tk-bank (openDocsUrl)="openDocsUrl($event)" />`,
})
export class BankComponent {
  private browserRef = inject(BrowserRef);

  openDocsUrl(url: string) {
    this.browserRef.window?.open(url, '_blank');
  }
}
