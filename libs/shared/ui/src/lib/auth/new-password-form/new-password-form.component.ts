import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
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
import { TrokaiErrorStateMatcher, canSaveForm } from '../../forms';

export interface NewPasswordValue {
  /** Present only when not in the forgot flow. */
  currentPassword?: string;
  password: string;
}

function newPasswordGroup(group: AbstractControl): ValidationErrors | null {
  const current = group.get('currentPassword');
  const next = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  const errors: ValidationErrors = {};
  if (next !== confirm) errors['passwordsMismatch'] = true;
  if (current && current.value && current.value === next)
    errors['newEqualCurrent'] = true;
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'tk-new-password-form',
  standalone: true,
  templateUrl: './new-password-form.component.html',
  styleUrls: ['./new-password-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPasswordFormComponent implements OnInit {
  /** Forgot flow: hide the current-password field. */
  @Input() forgot = false;
  @Input() loading = false;

  @Output() submitted = new EventEmitter<NewPasswordValue>();

  readonly matcher = new TrokaiErrorStateMatcher();
  hideCurrent = true;
  hideNext = true;
  hideConfirm = true;

  readonly form = new FormGroup(
    {
      currentPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      confirm: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
    },
    { validators: newPasswordGroup },
  );

  ngOnInit(): void {
    if (this.forgot) this.form.controls.currentPassword.disable();
  }

  get canSave(): boolean {
    return canSaveForm(this.form, false);
  }

  submit() {
    if (this.loading) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { currentPassword, password } = this.form.getRawValue();
    this.submitted.emit(
      this.forgot ? { password } : { currentPassword, password },
    );
  }
}
