import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { MediaService } from '@trokai/shared-core';
import { LoadingService } from '../../loading/loading.service';
import { TkImageCropperComponent, CropState } from '../image-cropper/tk-image-cropper.component';

/**
 * Platform-agnostic image picker. The image source is supplied by the injected
 * `MediaService` (web = file input, app = Capacitor camera/gallery); `capabilities`
 * drives which menu options are shown. The crop dialog is the shared `tk-image-cropper`.
 */
@Component({
  selector: 'tk-image-picker',
  standalone: true,
  imports: [NgClass, MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './tk-image-picker.component.html',
  styleUrl: './tk-image-picker.component.scss',
})
export class TkImagePickerComponent implements OnInit, OnDestroy {
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  @ViewChild('filePicker') filePicker!: ElementRef<HTMLInputElement>;

  @Input() mode: 'default' | 'button' = 'default';
  @Input() showPreview = false;
  @Input() externalURL: SafeUrl | string | null = null;
  @Input() disabled = false;
  @Input() profile = false;
  /** When false, file pick skips the crop dialog and emits the resized blob directly. */
  @Input() autoCrop = true;
  /** High-quality (.lg) server URL fetched by cropCurrentImage() for best crop resolution. */
  @Input() sourceLgUrl: string | null = null;
  /** Pre-crop original blob supplied by the parent. Used by cropCurrentImage(). */
  @Input() rawSource: Blob | null = null;
  /** Saved crop state to restore when the cropper is reopened. */
  @Input() cropState: CropState | null = null;

  @Output() imagePick = new EventEmitter<Blob | null>();
  /** Emitted only when a brand-new file is picked (not when cropping). Carries the pre-crop blob. */
  @Output() rawImagePick = new EventEmitter<Blob>();
  @Output() isSelecting = new EventEmitter<boolean>();
  @Output() cropStateChange = new EventEmitter<CropState>();
  /** Emitted when a server image is fetched for the first time so the parent can persist it as rawSource. */
  @Output() rawSourceChange = new EventEmitter<Blob>();

  /** SafeUrl backed by a blob: object URL. Cleared on remove/destroy. */
  selectedImage: SafeUrl | null = null;
  /** Latest resized-but-uncropped Blob so «Editar foto» can re-open the cropper. */
  rawImageData: Blob | null = null;
  /** When true the `<input type=file>` is rendered (no native gallery). */
  usePicker = false;

  private _selectedObjectUrl: string | null = null;

  public media = inject(MediaService);
  private sanitizer = inject(DomSanitizer);
  private dialog = inject(MatDialog);
  private ngZone = inject(NgZone);
  private loading = inject(LoadingService);

  ngOnInit() {
    this.usePicker = !this.media.capabilities.nativeGallery;
  }

  ngOnDestroy(): void {
    this.revokeSelectedUrl();
  }

  get canCrop(): boolean {
    return !!(
      this.rawImageData ||
      this.rawSource ||
      this.selectedImage ||
      this.externalURL
    );
  }

  get hasImage(): boolean {
    return !!(this.selectedImage || this.externalURL);
  }

  /** Create/replace the SafeUrl used to display the selected image, revoking the previous URL. */
  private setSelectedBlob(blob: Blob): void {
    this.revokeSelectedUrl();
    this._selectedObjectUrl = URL.createObjectURL(blob);
    this.selectedImage = this.sanitizer.bypassSecurityTrustUrl(
      this._selectedObjectUrl
    );
  }

  private revokeSelectedUrl(): void {
    if (this._selectedObjectUrl) {
      URL.revokeObjectURL(this._selectedObjectUrl);
      this._selectedObjectUrl = null;
    }
    this.selectedImage = null;
  }

  onPickImage() {
    if (this.disabled) return;
    // Native (camera) always shows the menu (camera vs gallery choice). On web with no
    // image yet, jump straight to the file picker; otherwise show the menu.
    if (this.media.capabilities.camera || this.hasImage) {
      this.menuTrigger.openMenu();
    } else {
      this.pickFromGallery();
    }
  }

  async takeFromCamera() {
    const blob = await this.media.openCameraPreview();
    if (!blob) return;
    this.ngZone.run(() => this.modalFile(blob));
  }

  async pickFromGallery() {
    if (this.media.capabilities.nativeGallery) {
      const blob = await this.media.pickSingleFromGallery();
      if (!blob) return;
      this.ngZone.run(() => this.handlePickedBlob(blob));
    } else {
      this.filePicker.nativeElement.click();
    }
  }

  async onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files?.[0];
    if (!pickedFile) return;

    this.isSelecting.emit(true);
    const blob = await this.media.processFile(pickedFile);
    if (!blob) {
      this.isSelecting.emit(false);
      return;
    }
    this.ngZone.run(() => this.handlePickedBlob(blob));
  }

  /** Route a freshly resized blob through the cropper or emit it directly. */
  private handlePickedBlob(blob: Blob) {
    if (this.autoCrop) {
      this.modalFile(blob);
    } else {
      this.rawImageData = blob;
      this.setSelectedBlob(blob);
      this.rawImagePick.emit(blob);
      this.imagePick.emit(blob);
      this.isSelecting.emit(false);
    }
  }

  modalFile(blob: Blob): Promise<void> {
    this.loading.start();

    const ref = this.dialog.open(TkImageCropperComponent, {
      data: {
        imageBlob: blob,
        profile: this.profile,
        cropState: this.cropState ?? null,
      },
      panelClass: 'dialog-large',
    });

    ref.afterOpened().subscribe(() => this.loading.finish());

    return firstValueFrom(ref.afterClosed()).then((data) => {
      this.ngZone.run(() => {
        if (!data || typeof data !== 'object') {
          this.isSelecting.emit(false);
          return;
        }
        if (data.cropState) {
          this.cropState = data.cropState;
          this.cropStateChange.emit(data.cropState);
        }
        if (data.croppedImage instanceof Blob) {
          this.setSelectedBlob(data.croppedImage);
          this.imagePick.emit(data.croppedImage);
        }
        this.isSelecting.emit(false);
      });
    });
  }

  /** Open the crop dialog for the currently held raw image. */
  async cropCurrentImage() {
    // Priority: rawImageData > rawSource > fetch from sourceLgUrl > fetch from externalURL
    const blob = this.rawImageData ?? this.rawSource ?? null;
    if (blob) {
      this.modalFile(blob);
      return;
    }
    const fetchUrl =
      this.sourceLgUrl ??
      (typeof this.externalURL === 'string' ? this.externalURL : null);
    if (!fetchUrl) return;
    try {
      const response = await fetch(fetchUrl);
      const fetched = await response.blob();
      // resizeBlob sniffs the format from raw bytes, so a wrong server Content-Type is fine.
      const resized = await this.media.resizeBlob(fetched);
      const finalBlob = resized ?? fetched;
      this.rawImageData = finalBlob;
      await this.modalFile(finalBlob);
      this.rawSourceChange.emit(finalBlob);
    } catch {
      /* silent */
    }
  }

  remove() {
    this.revokeSelectedUrl();
    this.rawImageData = null;
    this.imagePick.emit(null);
  }
}
