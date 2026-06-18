import { Injectable } from '@angular/core';
import { MediaService, MediaCapabilities } from '@trokai/shared-core';

/**
 * Web media impl: file-picker only (no native camera/gallery). The shared image-resize
 * pipeline lives in the base `MediaService`. Provided as `{ provide: MediaService,
 * useClass: WebMediaService }` in app.config.
 */
@Injectable()
export class WebMediaService extends MediaService {
  readonly capabilities: MediaCapabilities = {
    camera: false,
    nativeGallery: false,
  };

  openCameraPreview(): Promise<Blob | null> {
    return Promise.resolve(null);
  }

  pickSingleFromGallery(): Promise<Blob | null> {
    return Promise.resolve(null);
  }

  pickMultipleFromGallery(): Promise<Blob[]> {
    return Promise.resolve([]);
  }
}
