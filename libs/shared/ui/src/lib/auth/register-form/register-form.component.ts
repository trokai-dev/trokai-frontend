import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TrokaiErrorStateMatcher } from '../../forms';

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

const NAME_PATTERN = /^[A-Za-záàâãéèêíóôõúçÁÀÂÃÉÈÍÓÔÕÚÇ \d]+$/;

function fullName(control: AbstractControl): ValidationErrors | null {
  const value = (control.value ?? '').trim();
  if (!value) return null;
  return value.split(/\s+/).length >= 2 ? null : { fullName: true };
}

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pwd = group.get('password')?.value;
  const pwd2 = group.get('password2')?.value;
  return pwd === pwd2 ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'tk-register-form',
  standalone: true,
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterFormComponent {
  @Input() loading = false;
  /** Set by the shell after `emailBlur` resolves the availability check. */
  @Input() emailRegistered = false;

  @Output() submitted = new EventEmitter<RegisterCredentials>();
  @Output() emailBlur = new EventEmitter<string>();
  @Output() login = new EventEmitter<void>();

  readonly matcher = new TrokaiErrorStateMatcher();
  readonly emailMatcher: TrokaiErrorStateMatcher = {
    isErrorState: (ctrl: FormControl | null) =>
      this.matcher.isErrorState(ctrl, null) || this.emailRegistered,
  };
  hidePass1 = true;
  hidePass2 = true;

  readonly form = new FormGroup(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(NAME_PATTERN),
          fullName,
        ],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      password2: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
    },
    { validators: passwordsMatch },
  );

  onEmailBlur() {
    if (this.form.controls.email.valid)
      this.emailBlur.emit(this.form.controls.email.value);
  }

  submit() {
    if (this.loading) return;
    if (this.form.invalid || this.emailRegistered) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.form.getRawValue();
    this.submitted.emit({ name, email, password });
  }
}
