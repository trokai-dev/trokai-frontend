import { User } from '@trokai/shared-core';
import { lastValueFrom } from 'rxjs';
import {
  AlertService,
  SellerProfileComponent,
  SellerProfileValue,
} from '@trokai/shared-ui';
import { AuthService } from './../../auth/auth.service';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TkImagePickerComponent } from '@trokai/shared-ui';
import { environment } from '../../../environments/environment';
import { CompletingInformationService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-store-options',
  templateUrl: './store-options.component.html',
  styleUrls: ['./store-options.component.scss'],
  standalone: true,
  imports: [SellerProfileComponent, TkImagePickerComponent],
})
export class StoreOptionsComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private alert = inject(AlertService);
  private completingInfoService = inject(CompletingInformationService);

  user!: User;
  pictureUpdating = false;

  sellerReviews: { _id: number; info: string }[] = [];
  // undefined = sem alteração pendente, null = remoção pendente, Blob = nova foto pendente
  pendingAvatarBlob: Blob | null | undefined = undefined;
  previewAvatarUrl: string | null = null;

  get willHaveAvatar(): boolean {
    return (
      this.pendingAvatarBlob instanceof Blob ||
      (this.pendingAvatarBlob === undefined &&
        !!this.user?.avatar &&
        this.user.avatar !== '')
    );
  }

  ngOnInit() {
    this.authService.user$.subscribe((u) => {
      if (!u) return;
      this.user = u;

      if (
        ((u.seller?.adjusts?.length ?? 0) > 0 || u.seller?.adjustsNote) &&
        this.sellerReviews.length === 0
      ) {
        this.http
          .get<
            { _id: number; info: string }[]
          >(`${environment.urlApi}/seller-review`)
          .subscribe((reviews) => (this.sellerReviews = reviews));
      }
    });
  }

  getUserAvatar() {
    if (this.user.avatar && this.user.avatar != '')
      return (
        environment.imageURL + this.user._id + '/avatar/' + this.user.avatar
      );
    return environment.defaultAvatar;
  }

  onImagePicked(blob: Blob | null) {
    if (this.previewAvatarUrl) URL.revokeObjectURL(this.previewAvatarUrl);
    this.pendingAvatarBlob = blob;
    this.previewAvatarUrl = blob ? URL.createObjectURL(blob) : null;
  }

  async save(value: SellerProfileValue) {
    // PATCH /users/me expects FLAT keys (mapped to seller.* server-side).
    const patch = {
      inPerson: value.inPerson,
      shipping: value.shipping,
      storeName: value.storeName,
      nickname: value.nickname,
      profileBio: value.profileBio,
    };

    try {
      await this.authService.updateUser(patch);

      if (this.pendingAvatarBlob !== undefined) {
        this.pictureUpdating = true;
        try {
          if (this.pendingAvatarBlob === null) {
            await lastValueFrom(
              this.http.delete(environment.urlApi + '/users/me/avatar'),
            );
            this.authService.syncAvatar('');
          } else {
            await this.authService.uploadAvatar(this.pendingAvatarBlob);
          }
          this.pendingAvatarBlob = undefined;
        } finally {
          this.pictureUpdating = false;
        }
      }

      this.alert.postSuccess();
      this.completingInfoService.next();
    } catch {
      // updateUser surfaces its own error
    }
  }
}
