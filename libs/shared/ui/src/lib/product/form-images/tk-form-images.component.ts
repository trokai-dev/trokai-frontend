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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { MediaService, UploadPictureItem } from '@trokai/shared-core';
import { TkImagePickerComponent } from '../../media/image-picker/tk-image-picker.component';
import { CropState } from '../../media/image-cropper/tk-image-cropper.component';

/**
 * Internal UI state for a single image slot.
 *
 * blob !== null → new or re-cropped image — always uploaded.
 * blob === null → unmodified server image — kept by serverId on PATCH.
 */
export interface PictureSlot {
  /** SafeUrl (blob: object URL) or server https:// .sm URL. Passed to [externalURL]. */
  displayUrl: SafeUrl | string | null;
  /** Actual blob. null only for an unmodified server image. */
  blob: Blob | null;
  /** Pre-crop original blob. Restored into [rawSource] so "Ajustar foto" works. */
  rawSource: Blob | null;
  /** Saved crop position/zoom/rotation to restore on next open. */
  cropState: CropState | null;
  /** The blob: object URL backing displayUrl, tracked for revocation. */
  _objectUrl: string | null;
  /** Image _id on the server. null for locally-picked images. */
  serverId: string | null;
  /** Full server https .lg URL. Used for high-quality blob fetch on crop. */
  serverUrl: string | null;
  /** Full server https .sm URL. Used for display in the picker. */
  smUrl: string | null;
}

/**
 * Shared product-images form: reorderable grid of up to MAX_IMAGES pickers.
 * The image source is supplied by the injected `MediaService` — `capabilities.camera`
 * decides between a camera/gallery menu (native) and a plain multi-file input (web).
 * Platform side-effects (help dialog/tutorial, deactivate guard) stay in the shell via
 * `@Output() helpRequested`.
 */
@Component({
  selector: 'tk-form-images',
  standalone: true,
  templateUrl: './tk-form-images.component.html',
  styleUrl: './tk-form-images.component.scss',
  imports: [
    NgClass,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    DragAndDropModule,
    TkImagePickerComponent,
  ],
})
export class TkFormImagesComponent implements OnInit, OnDestroy {
  @Input() inputImages: UploadPictureItem[] = [];
  @Input() disabled = false;

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onOutputImages = new EventEmitter<UploadPictureItem[]>();
  /** The shell opens the platform "photo tips" surface (web dialog / app tutorial). */
  @Output() helpRequested = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('addMenu') addMenu?: MatMenuTrigger;

  slots: PictureSlot[] = [];
  isLoading = false;
  isDragging: number | null = null;
  readonly MAX_IMAGES = 6;

  private media = inject(MediaService);
  private ngZone = inject(NgZone);
  private sanitizer = inject(DomSanitizer);

  /** Native devices offer camera/gallery; web falls straight through to the file input. */
  get useNativeChooser(): boolean {
    return this.media.capabilities.camera;
  }

  ngOnInit() {
    if (this.inputImages?.length) {
      this.slots = this.inputImages
        .filter((i) => i?.blob || i?.serverId || i?.smUrl || i?.serverUrl)
        .map((i) => {
          if (i.blob instanceof Blob) {
            return this.createSlot(i.blob);
          }
          // Unmodified server image — display via its .sm URL, .lg for cropping.
          return {
            displayUrl: i.smUrl,
            blob: null,
            rawSource: null,
            cropState: null,
            _objectUrl: null,
            serverId: i.serverId,
            serverUrl: i.serverUrl,
            smUrl: i.smUrl,
          } as PictureSlot;
        });
    }
  }

  ngOnDestroy(): void {
    this.slots.forEach((s) => this.revokeSlot(s));
  }

  /** Create a PictureSlot from a Blob, generating a tracked SafeUrl for display. */
  private createSlot(blob: Blob, rawBlob?: Blob | null, cropState?: CropState | null): PictureSlot {
    const objectUrl = URL.createObjectURL(blob);
    return {
      displayUrl: this.sanitizer.bypassSecurityTrustUrl(objectUrl),
      blob,
      rawSource: rawBlob !== undefined ? rawBlob : blob,
      cropState: cropState ?? null,
      _objectUrl: objectUrl,
      serverId: null,
      serverUrl: null,
      smUrl: null,
    };
  }

  private revokeSlot(slot: PictureSlot): void {
    if (slot._objectUrl) URL.revokeObjectURL(slot._objectUrl);
  }

  private get remaining(): number {
    return this.MAX_IMAGES - this.slots.length;
  }

  /** Entry point for both the empty-state button and the add-more tile. */
  triggerAdd() {
    if (this.disabled || this.isLoading) return;
    if (this.useNativeChooser) {
      this.addMenu?.openMenu();
    } else {
      this.fileInput?.nativeElement.click();
    }
  }

  async pickFromCamera() {
    this.isLoading = true;
    try {
      const blob = await this.media.openCameraPreview();
      this.ngZone.run(() => {
        if (blob) {
          this.slots.push(this.createSlot(blob));
          this.emitChange();
        }
        this.isLoading = false;
      });
    } catch {
      this.ngZone.run(() => (this.isLoading = false));
    }
  }

  async pickFromGallery() {
    if (!this.media.capabilities.nativeGallery) {
      this.fileInput?.nativeElement.click();
      return;
    }
    this.isLoading = true;
    try {
      const blobs = await this.media.pickMultipleFromGallery(this.remaining);
      this.ngZone.run(() => {
        blobs.forEach((blob) => {
          if (this.slots.length < this.MAX_IMAGES) this.slots.push(this.createSlot(blob));
        });
        if (blobs.length) this.emitChange();
        this.isLoading = false;
      });
    } catch {
      this.ngZone.run(() => (this.isLoading = false));
    }
  }

  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.isLoading = true;
    const files = Array.from(input.files).slice(0, this.remaining);

    try {
      const blobs = await Promise.all(files.map((f) => this.media.processFile(f)));
      this.ngZone.run(() => {
        blobs.filter((b): b is Blob => !!b).forEach((blob) => this.slots.push(this.createSlot(blob)));
        this.emitChange();
        this.isLoading = false;
        input.value = '';
      });
    } catch {
      this.ngZone.run(() => {
        this.isLoading = false;
        input.value = '';
      });
    }
  }

  dragStart(index: number) {
    this.isDragging = index;
  }
  dragEnd() {
    this.isDragging = null;
  }

  dropped(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const [moved] = this.slots.splice(fromIndex, 1);
    this.slots.splice(toIndex, 0, moved);
    this.emitChange();
  }

  /** blob === null → user removed the image; revoke URL and remove the slot entirely. */
  onImagePicked(blob: Blob | null, index: number) {
    if (blob === null) {
      this.revokeSlot(this.slots[index]);
      this.slots.splice(index, 1);
    } else {
      const old = this.slots[index];
      this.revokeSlot(old);
      this.slots[index] = this.createSlot(blob, old.rawSource, old.cropState);
    }
    this.emitChange();
  }

  /** A brand-new file was picked inside the picker (not a crop result) → reset raw source + crop state. */
  onRawImagePicked(rawBlob: Blob, index: number) {
    this.slots[index] = { ...this.slots[index], rawSource: rawBlob, cropState: null };
  }

  /** Cropper closed → persist the state so it's restored on next open. */
  onCropStateChange(cropState: CropState, index: number) {
    this.slots[index] = { ...this.slots[index], cropState };
  }

  /** Server image fetched for the first time → store as rawSource without touching cropState.
   *  Mutate in-place (no new object) so the picker component is NOT recreated, which would
   *  orphan the in-flight crop call on the old instance. */
  onRawSourceChange(rawBlob: Blob, index: number) {
    this.slots[index].rawSource = rawBlob;
  }

  emitChange() {
    this.onOutputImages.emit(
      this.slots
        .filter((s) => s.blob || s.serverId || s.smUrl || s.serverUrl)
        .map((s): UploadPictureItem => ({
          blob: s.blob,
          serverId: s.serverId,
          serverUrl: s.serverUrl,
          smUrl: s.smUrl,
        })),
    );
  }
}
