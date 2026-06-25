import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
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
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskDirective } from 'ngx-mask';
import dayjs from 'dayjs';
import { User } from '@trokai/shared-core';
import { AlertService } from '../../alert/alert.service';
import { FeedbackService } from '@trokai/shared-core';
import { canSaveForm } from '../../forms';

export interface ProfileFormValue {
  name: string;
  email: string;
  cpf: string; // digits only
  phone: string; // digits only
  birthday: Date;
}

const NAME_PATTERN = /^[A-Za-záàâãéèêíóôõúçÁÀÂÃÉÈÍÓÔÕÚÇ \d]+$/;

@Component({
  selector: 'tk-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    NgxMaskDirective,
  ],
})
export class ProfileFormComponent implements OnChanges {
  @Input() user!: User;
  @Input() loading = false;
  @Input() completingInformation = false;
  @Input() emailRegistered = false;
  @Input() phoneRegistered = false;

  @Output() submitted = new EventEmitter<ProfileFormValue>();
  @Output() emailBlur = new EventEmitter<string>();
  @Output() phoneBlur = new EventEmitter<string>();
  @Output() verifyPhone = new EventEmitter<void>();

  shortName = false;
  nameValid = true;
  under18 = false;
  invalidBirth = false;
  showedDocMsg = false;
  private hadInitialData = false;

  readonly form = new FormGroup({
    name: new FormControl<string | null>(null, [
      Validators.required,
      Validators.minLength(3),
    ]),
    email: new FormControl<string | null>(null, [
      Validators.required,
      Validators.email,
    ]),
    cpf: new FormControl<string | null>(null, [Validators.required]),
    birthday: new FormControl<string | null>(null, [Validators.required]),
    phone: new FormControl<string | null>(null, [Validators.required]),
  });

  readonly nameErrorMatcher: ErrorStateMatcher = {
    isErrorState: (ctrl: FormControl) =>
      (ctrl && ctrl.invalid && ctrl.dirty) || this.shortName || !this.nameValid,
  };
  readonly emailErrorMatcher: ErrorStateMatcher = {
    isErrorState: (ctrl: FormControl) =>
      (ctrl && ctrl.invalid && ctrl.dirty) || this.emailRegistered,
  };
  readonly phoneErrorMatcher: ErrorStateMatcher = {
    isErrorState: (ctrl: FormControl) =>
      (ctrl && ctrl.invalid && ctrl.dirty) || this.phoneRegistered,
  };
  readonly birthErrorMatcher: ErrorStateMatcher = {
    isErrorState: (ctrl: FormControl) =>
      (ctrl && ctrl.invalid && ctrl.dirty) || this.under18 || this.invalidBirth,
  };

  private alertService = inject(AlertService);
  private feedback = inject(FeedbackService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) this.fillForm();
  }

  get canSave(): boolean {
    return canSaveForm(this.form, this.hadInitialData);
  }

  fillForm() {
    this.hadInitialData = !!(this.user.name && this.user.cpf);
    if (this.form.valid) return;
    this.form.patchValue({
      name: this.user.name,
      email: this.user.email,
      cpf: this.user.cpf,
      phone: this.user.phone,
    });

    if (this.user.cpf) this.form.get('cpf')!.disable();

    if (this.user.birthday) {
      this.form
        .get('birthday')!
        .setValue(dayjs(this.user.birthday).format('DD/MM/YYYY'));
      this.form.get('birthday')!.disable();
    }

    this.changeName();
  }

  changeName() {
    const value = this.form.get('name')!.value ?? '';
    this.shortName = !!value && value.trim().split(' ').length === 1;
    this.nameValid = NAME_PATTERN.test(value);
  }

  changeBirthday() {
    const formDate = this.form.get('birthday');
    if (!formDate || formDate.disabled) return;

    const mDate = dayjs(this.parseDateString(formDate.value!));
    if (formDate.value && formDate.valid && mDate.isValid()) {
      this.invalidBirth = false;
      this.under18 = dayjs(new Date()).diff(mDate, 'year') < 18;
    } else {
      this.under18 = false;
      this.invalidBirth = true;
    }
  }

  focusCPF() {
    if (this.showedDocMsg) return;
    this.alertService.showDialog(
      'Atenção ao CPF',
      'Se você fizer uma venda pelo Trokaí, a conta bancária utilizada para receber o pagamento deverá estar vinculada a esse mesmo CPF. Caso o documento cadastrado pertença a um menor de 18 anos, a conta não poderá publicar anúncios.',
    );
    this.showedDocMsg = true;
  }

  onEmailBlur() {
    if (this.form.get('email')!.valid)
      this.emailBlur.emit(this.form.get('email')!.value ?? undefined);
  }

  onPhoneBlur() {
    if (this.form.get('phone')!.valid)
      this.phoneBlur.emit(this.form.get('phone')!.value ?? undefined);
  }

  get phoneMatches(): boolean {
    return (
      this.form.get('phone')!.valid &&
      this.form.get('phone')!.value === this.user?.phone &&
      !this.phoneRegistered
    );
  }

  parseDateString(input: string) {
    const [day, month, year] = input.split('/');
    return `${month}/${day}/${year}`;
  }

  submit() {
    if (this.loading) return;
    this.changeBirthday();

    if (this.under18 || this.shortName || !this.nameValid) return;

    if (this.form.invalid) {
      this.feedback.error('Preencha todos os campos corretamente');
      return;
    }

    this.submitted.emit({
      name: this.form.get('name')!.value!,
      email: this.form.get('email')!.value!,
      cpf: this.digits(this.form.get('cpf')!.value!),
      phone: this.digits(this.form.get('phone')!.value!),
      birthday: new Date(
        this.parseDateString(this.form.get('birthday')!.value!),
      ),
    });
  }

  private digits(value: string): string {
    return value ? (value.match(/\d/g) ?? []).join('') : value;
  }
}
