import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PreloadService {
  private meta = inject(Meta);
  private platformId = inject<object>(PLATFORM_ID);

  preloadImage(url: string) {
    if (!isPlatformServer(this.platformId)) return;

    this.meta.addTags([
      {
        rel: 'preload',
        as: 'image',
        href: url,
        fetchpriority: 'high',
      },
    ]);
  }

  preloadMobileAndDesk(mobileUrl: string, desktopUrl: string) {
    if (!isPlatformServer(this.platformId)) return;

    this.meta.addTags([
      {
        rel: 'preload',
        as: 'image',
        href: desktopUrl,
        media: '(min-width: 769px)',
        fetchpriority: 'high',
      },
      {
        rel: 'preload',
        as: 'image',
        href: mobileUrl,
        media: '(max-width: 768px)',
        fetchpriority: 'high',
      },
    ]);
  }
}
