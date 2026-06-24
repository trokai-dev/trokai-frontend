import { AbstractControl } from '@angular/forms';

/**
 * Save should be enabled once a form is valid AND either the user changed
 * something (dirty) or there was nothing saved yet to protect (no initial data).
 */
export function canSaveForm(
  form: AbstractControl,
  hadInitialData: boolean,
): boolean {
  return form.valid && (form.dirty || !hadInitialData);
}
