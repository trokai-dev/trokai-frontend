import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import dayjs from 'dayjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { DialogService } from './dialog.service';
import { Coupon } from '@trokai/shared-data-access';
import { GenericDataRefs, StorageService } from '@trokai/shared-core';

@Injectable({
  providedIn: 'root',
})
export class MarketingService {
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);
  private storage = inject(StorageService);
  private platformId = inject(PLATFORM_ID);

  private showed = false;
  private expired = false;
  private lastScrollY = 0;
  private lastCouponCheck = '';

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    void this.loadShownState();
  }

  private async loadShownState() {
    const date = await this.storage.get('exit-popup-showed');
    if (!date) return;

    this.showed = true;

    // Check if the last time the popup was shown was more than 7 days ago
    this.expired = dayjs().diff(dayjs(date), 'days') >= 7;
  }

  private async exitPopup() {
    // disable for now
    return;

    if (this.showed && !this.expired) return;

    this.dialogService.openExitDialog();

    this.showed = true;
    this.expired = false;

    await this.storage.set('exit-popup-showed', dayjs().toISOString());
  }

  async saveExitReason(reason: string, message: string, email: string) {
    await lastValueFrom(
      this.http.post(
        `${environment.urlApi}/generic-data/${GenericDataRefs.EXIT_INTENT_POPUP}`,
        {
          reason,
          message,
          email,
        },
      ),
    );
  }

  async checkCoupon(code: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!code || code === this.lastCouponCheck) return;

    this.lastCouponCheck = code;

    const res = await lastValueFrom(
      this.http.get<Coupon>(`${environment.urlApi}/coupon-info/${code}`),
    );

    await this.dialogService.openCouponDialog(res);
  }

  // DESKTOP
  mouseLeaveDesktop(clientY: number) {
    // Check if cursor is moving outside the viewport boundaries
    if (clientY <= 0 || clientY >= document.documentElement.clientHeight)
      this.exitPopup();
  }

  // MOBILE
  onScroll(currentScrollY: number) {
    // Check if scrolled to top (consider a small tolerance for minor scrolling)
    if (currentScrollY <= 10 && this.lastScrollY > currentScrollY)
      this.exitPopup();

    this.lastScrollY = currentScrollY;
  }

  resetScroll() {
    this.lastScrollY = 0;
  }

  onPopState() {
    this.exitPopup();
  }
}
