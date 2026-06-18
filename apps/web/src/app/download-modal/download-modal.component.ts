import { BrowserRef } from '../services/browser-ref.service';
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
// import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-download-modal',
  templateUrl: './download-modal.component.html',
  styleUrls: ['./download-modal.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
})
export class DownloadModalComponent {
  dialogRef = inject<MatDialogRef<DownloadModalComponent>>(MatDialogRef);
  private platformId = inject(PLATFORM_ID);
  private browserRef = inject(BrowserRef);

  isAndroid = false;
  isApple = false;

  clickDownload(platform: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    // this.gtmService.pushTag({ event: 'click_download_app' });

    if (platform == 'android')
      this.browserRef.window?.open(environment.googlePlayLink, '_blank');

    if (platform == 'ios')
      this.browserRef.window?.open(environment.appStoreLink, '_blank');
  }
}
