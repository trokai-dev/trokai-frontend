import { Injectable } from '@angular/core';

/** What image sources the running platform can offer the picker UI. */
export interface MediaCapabilities {
  /** Native camera capture is available (Capacitor Camera on device). */
  camera: boolean;
  /** Native gallery picker is available (otherwise the web `<input type=file>` is used). */
  nativeGallery: boolean;
}

/**
 * Platform-agnostic image acquisition + processing. Each app provides one impl:
 * web = `<input type=file>` only (`WebMediaService`), app = Capacitor Camera/gallery
 * (`MobileMediaService`). The shared image-resize pipeline lives here once; only the
 * native capture surface is abstract.
 *
 * Components inject `MediaService` and read `capabilities` to decide which options to
 * show — they never touch Capacitor or the platform directly.
 */
@Injectable()
export abstract class MediaService {
  /** Max width for resized images — matches the backend 'lg' (1200px) variant with headroom. */
  protected readonly MAX_PIXEL_WIDTH = 1600;

  /** Native source availability for the current platform. */
  abstract readonly capabilities: MediaCapabilities;

  /** Open the native camera and return a resized JPEG Blob (or null). Web impl returns null. */
  abstract openCameraPreview(): Promise<Blob | null>;

  /** Pick a single photo from the native gallery, resized (or null). Web impl returns null. */
  abstract pickSingleFromGallery(): Promise<Blob | null>;

  /** Pick up to `limit` photos from the native gallery, resized. Web impl returns []. */
  abstract pickMultipleFromGallery(limit: number): Promise<Blob[]>;

  // ---- shared image processing (browser canvas; runs only on user interaction) ----

  /** Convert a canvas to a JPEG Blob at 90% quality. */
  protected canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error('toBlob returned null')),
        'image/jpeg',
        0.9
      );
    });
  }

  /**
   * Resize any image Blob (or File) to MAX_PIXEL_WIDTH wide and return a JPEG Blob.
   * Only downscales — never upscales.
   */
  resizeBlob(blob: Blob): Promise<Blob | null> {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(blob);
      const image = new Image();

      image.onload = async () => {
        URL.revokeObjectURL(objectUrl);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        let width = image.width;
        let height = image.height;

        if (width > this.MAX_PIXEL_WIDTH) {
          height = Math.round((this.MAX_PIXEL_WIDTH / width) * height);
          width = this.MAX_PIXEL_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        try {
          resolve(await this.canvasToBlob(canvas));
        } catch {
          resolve(null);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
      image.src = objectUrl;
    });
  }

  /** Resize a base64-encoded image to MAX_PIXEL_WIDTH wide and return a JPEG Blob. */
  resizeBase64(base64: string): Promise<Blob | null> {
    return new Promise((resolve) => {
      const image = new Image();

      image.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        let width = image.width;
        let height = image.height;

        if (width > this.MAX_PIXEL_WIDTH) {
          height = Math.round((this.MAX_PIXEL_WIDTH / width) * height);
          width = this.MAX_PIXEL_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        try {
          resolve(await this.canvasToBlob(canvas));
        } catch {
          resolve(null);
        }
      };

      image.onerror = () => resolve(null);
      image.src = base64;
    });
  }

  /**
   * Read a File selected via `<input type=file>`, resize it, return a JPEG Blob.
   * File extends Blob, so resizeBlob handles it directly.
   */
  processFile(file: File): Promise<Blob | null> {
    return this.resizeBlob(file);
  }
}
