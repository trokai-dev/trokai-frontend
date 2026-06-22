import { inject, Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  GalleryPhoto,
} from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { ModalController } from '@ionic/angular/standalone';
import { MediaService, MediaCapabilities } from '@trokai/shared-core';
import { CameraPreviewComponent } from '../shared/components/camera-preview/camera-preview.component';

/**
 * Mobile media impl: Capacitor camera + native gallery. The shared image-resize pipeline
 * (resizeBlob/resizeBase64/processFile) is inherited from the base `MediaService`.
 * Provided as `{ provide: MediaService, useClass: MobileMediaService }` in main.ts.
 */
@Injectable()
export class MobileMediaService extends MediaService {
  private modalCtrl = inject(ModalController);

  readonly capabilities: MediaCapabilities = {
    camera: Capacitor.isPluginAvailable('Camera'),
    nativeGallery: Capacitor.isPluginAvailable('Camera'),
  };

  /** Read a Capacitor GalleryPhoto, resize it, and return a JPEG Blob. */
  private async processGalleryPhoto(photo: GalleryPhoto): Promise<Blob | null> {
    try {
      // webPath is Capacitor's local-server URL — fetch() works on iOS & Android
      // without a base64 round-trip. Fall back to Filesystem only when unavailable.
      if (photo.webPath) {
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        return this.resizeBlob(blob);
      }
      const contents = await Filesystem.readFile({ path: photo.path! });
      return this.resizeBase64('data:image/jpeg;base64,' + contents.data);
    } catch {
      return null;
    }
  }

  /** Open the custom camera preview modal and return the resized JPEG Blob (or null). */
  async openCameraPreview(): Promise<Blob | null> {
    const modal = await this.modalCtrl.create({
      component: CameraPreviewComponent,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (!data?.image) return null;
    return this.resizeBase64(data.image);
  }

  /** Pick a single photo from the device gallery and return the resized JPEG Blob (or null). */
  async pickSingleFromGallery(): Promise<Blob | null> {
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.photos !== 'granted') {
        await Camera.requestPermissions({ permissions: ['photos'] });
      }
      const photo = await Camera.getPhoto({
        source: CameraSource.Photos,
        resultType: CameraResultType.Uri,
        quality: 90,
      });
      if (!photo?.webPath) return null;
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      return this.resizeBlob(blob);
    } catch {
      return null;
    }
  }

  /** Pick up to `limit` photos from the gallery and return resized JPEG Blobs. */
  async pickMultipleFromGallery(limit: number): Promise<Blob[]> {
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.photos !== 'granted') {
        await Camera.requestPermissions({ permissions: ['photos'] });
      }
      const result = await Camera.pickImages({ quality: 90, limit });
      if (!result?.photos?.length) return [];
      const blobs = await Promise.all(
        result.photos.map((p) => this.processGalleryPhoto(p)),
      );
      return blobs.filter(Boolean) as Blob[];
    } catch {
      return [];
    }
  }
}
