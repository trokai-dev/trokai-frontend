import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TrokaiErrorStateMatcher } from '../../forms';

@Component({
  selector: 'tk-recovery-email-form',
  standalone: true,
  templateUrl: './recovery-email-form.component.html',
  styleUrls: ['./recovery-email-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryEmailFormComponent {
  @Input() loading = false;
  @Output() submitted = new EventEmitter<string>();

  readonly matcher = new TrokaiErrorStateMatcher();
  readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  submit() {
    if (this.loading) return;
    if (this.email.invalid) {
      this.email.markAsTouched();
      return;
    }
    this.submitted.emit(this.email.value);
  }
}
