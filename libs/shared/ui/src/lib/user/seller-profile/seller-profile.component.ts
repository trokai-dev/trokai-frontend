import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Clipboard } from '@angular/cdk/clipboard';
import {
  SellerProfileStatus,
  StoreVisibility,
  User,
} from '@trokai/shared-core';
import { TkUserAvatarComponent } from '../user-avatar/user-avatar.component';
import { AlertService } from '../../alert/alert.service';
import { FeedbackService } from '@trokai/shared-core';
import { canSaveForm } from '../../forms';

export interface SellerProfileValue {
  storeName: string;
  nickname: string;
  inPerson: boolean;
  shipping: boolean;
  profileBio: string;
  storeVisibility: StoreVisibility;
}

@Component({
  selector: 'tk-seller-profile',
  templateUrl: './seller-profile.component.html',
  styleUrls: ['./seller-profile.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    TextFieldModule,
    TkUserAvatarComponent,
  ],
})
export class SellerProfileComponent implements OnInit {
  @Input() user!: User;
  @Input() previewAvatarUrl?: string;
  @Input() pictureUpdating = false;
  /** Whether the seller will have an avatar after save (deferred-upload aware). */
  @Input() avatarPresent = true;
  @Input() requireAvatar = true;
  @Input() showBio = true;
  @Input() showStoreVisibility = false;
  /** Seller-review records used to label requested adjustments (web). */
  @Input() sellerReviews: { _id: number; info: string }[] = [];

  @Output() submitted = new EventEmitter<SellerProfileValue>();

  readonly SellerProfileStatus = SellerProfileStatus;
  readonly StoreVisibility = StoreVisibility;
  readonly nicknamePattern = /^[a-zA-Z0-9._-]+(?<!\.)$/;

  submitAttempted = false;
  initialNickname: string | null = null;
  nicknameEdited = false;
  private hadInitialData = false;

  readonly form = new FormGroup({
    storeName: new FormControl<string | null>(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]),
    nickname: new FormControl<string | null>(null, [
      Validators.required,
      Validators.pattern(this.nicknamePattern),
      Validators.minLength(3),
      Validators.maxLength(25),
    ]),
    inPerson: new FormControl<boolean | null>(null),
    shipping: new FormControl<boolean | null>(null),
    profileBio: new FormControl<string | null>(null, Validators.maxLength(160)),
    storeVisibility: new FormControl<StoreVisibility | null>(null),
  });

  readonly nicknameErrorMatcher: ErrorStateMatcher = {
    isErrorState: (ctrl: FormControl) =>
      ctrl && ctrl.dirty && this.invalidNickname(),
  };

  private alert = inject(AlertService);
  private feedback = inject(FeedbackService);
  private clipboard = inject(Clipboard);

  ngOnInit() {
    if (this.user) {
      this.hadInitialData = !!this.user.seller?.storeName;
      this.form.patchValue(
        (this.user.seller ?? {}) as Partial<SellerProfileValue> & object,
      );
      this.initialNickname = this.user.seller?.nickname;
      if (this.user.seller?.nickname) this.nicknameEdited = true;
      if (this.showStoreVisibility && this.user.seller?.storeVisibility == null) {
        this.form.get('storeVisibility')?.setValue(StoreVisibility.OPEN);
      }
    }

    this.form
      .get('storeName')
      ?.valueChanges.subscribe((value: string | null) => {
        if (!this.nicknameEdited) {
          const nicknameField = this.form.get('nickname');
          if (nicknameField) {
            nicknameField.setValue(this.toSlug(value ?? ''), {
              emitEvent: false,
            });
          }
        }
      });
  }

  get avatarSatisfied(): boolean {
    return !this.requireAvatar || this.avatarPresent;
  }

  get canSave(): boolean {
    return canSaveForm(this.form, this.hadInitialData);
  }

  getAdjustLabel(id: number): string {
    return this.sellerReviews.find((r) => r._id === id)?.info ?? '';
  }

  formValid(): boolean {
    if (!this.avatarSatisfied) return false;

    if (!this.form.valid) {
      this.feedback.error('Preencha os campos corretamente');
      return false;
    }

    const shippingField = this.form.get('shipping');
    const inPersonField = this.form.get('inPerson');
    if (shippingField && inPersonField) {
      if (!shippingField.value && !inPersonField.value) {
        return false;
      }
    }

    const storeVisibilityField = this.form.get('storeVisibility');
    if (
      this.showStoreVisibility &&
      storeVisibilityField &&
      !storeVisibilityField.value
    ) {
      return false;
    }

    return true;
  }

  async save() {
    this.submitAttempted = true;
    if (!this.formValid()) return;

    const nicknameField = this.form.get('nickname');
    const nickname = nicknameField?.value?.toLowerCase() ?? '';

    if (this.initialNickname && nickname != this.initialNickname) {
      const ok = await this.alert.question(
        'Ao mudar seu nickname, os links antigos para seu armário deixam de funcionar. Deseja continuar?',
        'Alteração de nickname',
        'Confirmar alteração',
        'Cancelar',
      );
      if (!ok) {
        nicknameField?.setValue(this.initialNickname);
        return;
      }
    }

    const formValue = this.form.value;

    this.submitted.emit({
      storeName: formValue.storeName as string,
      nickname,
      inPerson: formValue.inPerson as boolean,
      shipping: formValue.shipping as boolean,
      profileBio: formValue.profileBio as string,
      storeVisibility: formValue.storeVisibility as StoreVisibility,
    });
  }

  invalidNickname(): boolean {
    const field = this.form.get('nickname');
    return field != null && field.errors && field.errors['pattern'];
  }

  changeNickname() {
    this.nicknameEdited = true;

    const field = this.form.get('nickname');
    if (field == null) return;

    const word = field.value ?? '';

    const newWord = word
      .toLowerCase()
      .replace(/ +/g, '-')
      .replace(/[^a-z0-9._-]/g, '')
      .replace(/-+/g, '-');

    if (newWord !== word) field.setValue(newWord);
  }

  trimNickname() {
    const field = this.form.get('nickname');
    if (field == null) return;

    const value: string = field.value ?? '';
    field.setValue(value.replace(/[-_.]+$/, ''));
  }

  copyLink() {
    const field = this.form.get('nickname');
    if (field == null) return;

    this.clipboard.copy(`https://trokai.com.br/${field.value}`);
    this.feedback.success('Link da loja copiado!');
  }

  toSlug(value: string): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 25)
      .replace(/\.$/, '');
  }
}
