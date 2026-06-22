import { Component, OnInit, ViewChild, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  CropperPosition,
  ImageCroppedEvent,
  ImageCropperComponent,
  ImageTransform,
} from 'ngx-image-cropper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AlertService } from '../../alert/alert.service';

export interface CropState {
  cropper: CropperPosition;
  transform: ImageTransform;
  canvasRotation: number;
  scale: number;
}

@Component({
  selector: 'tk-image-cropper',
  standalone: true,
  imports: [
    MatDialogModule,
    ImageCropperComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './tk-image-cropper.component.html',
  styleUrl: './tk-image-cropper.component.scss',
})
export class TkImageCropperComponent implements OnInit {
  @ViewChild('cropper') imgCropper!: ImageCropperComponent;

  croppedBlob: Blob | null = null;

  myImageFile!: File;

  transform: ImageTransform = {};

  canvasRotation = 0;
  scale = 1;

  _cropper: CropperPosition = { x1: 0, y1: 0, x2: 100, y2: 100 };

  tooLarge = false;
  tooTall = false;

  aspect: number | null = null;
  hasSavedState = false;

  private dialogRef = inject(MatDialogRef<TkImageCropperComponent>);
  private alert = inject(AlertService);
  public data = inject<{
    profile: boolean;
    imageBlob: Blob;
    cropState?: CropState;
  }>(MAT_DIALOG_DATA);

  ngOnInit() {
    if (this.data.profile) this.aspect = 1;

    // Convert Blob to File for ngx-image-cropper. Force image/jpeg when the blob
    // has no image MIME type (e.g. server sends application/octet-stream) so
    // ngx-image-cropper doesn't reject it.
    const blobType = this.data.imageBlob.type;
    const mimeType =
      blobType && blobType.startsWith('image/') ? blobType : 'image/jpeg';
    this.myImageFile = new File([this.data.imageBlob], 'image.jpg', {
      type: mimeType,
    });

    if (this.data.cropState) {
      this.hasSavedState = true;
      this.transform = { ...this.data.cropState.transform };
      this.canvasRotation = this.data.cropState.canvasRotation;
      this.scale = this.data.cropState.scale;
    }
  }

  private buildCropState(): CropState {
    return {
      cropper: { ...this._cropper },
      transform: { ...this.transform },
      canvasRotation: this.canvasRotation,
      scale: this.scale,
    };
  }

  onCancel() {
    if (!this.myImageFile) return;
    this.dialogRef.close({
      croppedImage: this.data.imageBlob,
      cropState: this.buildCropState(),
    });
  }

  rotate() {
    if (!this.myImageFile) return;
    this.canvasRotation++;
  }

  zoom(zoomIn: boolean) {
    if (!this.myImageFile) return;
    if (zoomIn) this.scale += 0.1;
    else this.scale -= 0.1;
    this.transform = { ...this.transform, scale: this.scale };
  }

  close() {
    this.dialogRef.close({ cropState: this.buildCropState() });
  }

  imageLoaded() {
    // Always defer — run AFTER the library finishes its own internal layout.
    setTimeout(() => {
      if (this.hasSavedState && this.data.cropState) {
        this._cropper = { ...this.data.cropState.cropper };
      } else {
        const el = document.querySelector('.ngx-ic-source-image');
        if (el && el.clientWidth && el.clientHeight) {
          this._cropper = {
            x1: 0,
            y1: 0,
            x2: el.clientWidth,
            y2: el.clientHeight,
          };
        }
      }
    }, 200);
  }

  saveAndLeave() {
    if (!this.myImageFile || !this.croppedBlob) return;

    if (this.tooLarge) {
      this.alert.alert('Diminua a largura ou aumente a altura');
      return;
    }

    if (this.tooTall) {
      this.alert.alert('Aumente a largura ou diminua a altura');
      return;
    }

    this.dialogRef.close({
      croppedImage: this.croppedBlob,
      cropState: this.buildCropState(),
    });
  }

  crop(event: ImageCroppedEvent) {
    const aspect = event.width / event.height;
    this.tooLarge = aspect > 2.3;
    this.tooTall = aspect < 0.32;
    this.croppedBlob = event.blob ?? null;
  }
}
