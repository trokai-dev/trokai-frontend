import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TrokaiErrorStateMatcher } from '../../forms';

@Component({
  selector: 'tk-recovery-code-form',
  standalone: true,
  templateUrl: './recovery-code-form.component.html',
  styleUrls: ['./recovery-code-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryCodeFormComponent {
  @Input() loading = false;
  /** Emit automatically once the 4-digit code is entered (mobile UX). */
  @Input() autoSubmit = false;

  @Output() submitted = new EventEmitter<string>();

  readonly matcher = new TrokaiErrorStateMatcher();
  readonly code = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(4)],
  });

  onInput() {
    if (this.autoSubmit && this.code.value?.toString().length === 4)
      this.submit();
  }

  submit() {
    if (this.loading) return;
    if (this.code.invalid) {
      this.code.markAsTouched();
      return;
    }
    this.submitted.emit(this.code.value);
  }
}
