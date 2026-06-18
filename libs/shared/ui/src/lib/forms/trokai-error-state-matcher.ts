import { Injectable } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Centralized M3 error boundary: surface mat-error on touch OR dirty OR submit.
 * Use as the shared default across every migrated Trokaí form field.
 */
@Injectable({ providedIn: 'root' })
export class TrokaiErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const interacted = !!(control && (control.dirty || control.touched));
    const submitted = !!form?.submitted;
    return !!control && control.invalid && (interacted || submitted);
  }
}
