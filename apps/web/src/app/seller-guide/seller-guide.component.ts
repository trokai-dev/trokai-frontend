import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-seller-guide',
  templateUrl: './seller-guide.component.html',
  styleUrls: ['./seller-guide.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
})
export class SellerGuideComponent implements OnInit {
  private globalService = inject(GlobalService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  readonly pdfRawUrl = 'assets/pdf/manual-boas-praticas-vendedor-trokai.pdf';
  safePdfUrl: SafeResourceUrl | null = null;
  isBrowser!: boolean;
  isMobile = false;

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(
        navigator.userAgent,
      );
      if (!this.isMobile) {
        this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.pdfRawUrl + '#zoom=50',
        );
      }
    }
    this.globalService.setTitle('Manual de Boas Práticas para Vendedores');
  }

  openPdf(): void {
    window.open(this.pdfRawUrl, '_blank');
  }
}
