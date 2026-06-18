import { BasicModel } from '@trokai/shared-core';
import { TitleCasePipe, AsyncPipe } from '@angular/common';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ErrorStateMatcher, MatOptionModule } from '@angular/material/core';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'tk-autocomplete',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTooltipModule,
    MatOptionModule,
    AsyncPipe,
    TitleCasePipe,
  ],
  templateUrl: './tk-autocomplete.component.html',
  styleUrl: './tk-autocomplete.component.scss',
})
export class TkAutocompleteComponent<T extends BasicModel<string | number>>
  implements OnInit
{
  @Input() options!: T[];
  @Input() minLength = 0;
  @Input() name!: string;
  @Input() parentForm!: FormGroup;
  @Input() controlName!: string;
  @Input() allowCustom = false;

  filteredOptions!: Observable<T[]>;

  notOnList = false;

  @Output() selected = new EventEmitter();

  readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: (ctrl: FormControl) =>
      ctrl && ctrl.dirty && this.notOnList && !this.allowCustom,
  };

  ngOnInit() {
    this.filteredOptions = this.parentForm
      .get(this.controlName)!
      .valueChanges.pipe(
        startWith(''),
        map((value) => {
          // check if selected already
          if (value && typeof value !== 'string') return [];

          const len = value ? value.length : 0;

          // open by default
          if (this.minLength == 0) return this._filter(value ?? '');
          if (len < this.minLength) return [];

          return this._filter(value ?? '');
        })
      );
  }

  displayFn(option: T): string {
    const tcp = new TitleCasePipe();
    return tcp.transform(option?.value);
  }

  private _filter(value: string): T[] {
    const normalizedFilter = value.toLowerCase();

    return this.options
      .map((option) => {
        const optionValue = option.value.toString().toLowerCase();
        let score = 0;

        if (optionValue === normalizedFilter) {
          score = 3; // exact match
        } else if (optionValue.startsWith(normalizedFilter)) {
          score = 2; // starts with
        } else if (optionValue.includes(normalizedFilter)) {
          score = 1; // contains
        }

        return { option, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.option);
  }

  change() {
    const val: any = this.parentForm.get(this.controlName)!.value;
    this.notOnList = val?._id == null || val?.value == null;

    if ((!this.notOnList && !this.allowCustom) || val == null)
      this.selected.emit(val);
  }

  clear() {
    this.parentForm.get(this.controlName)!.setValue(null);
    this.change();
  }

  verify() {
    // user typed something after selecting
    const ctrl: any = this.parentForm.get(this.controlName)!.value;

    if (!ctrl || !ctrl.value) {
      this.change();
      return;
    }

    if (
      !this.allowCustom &&
      !this.options.find(
        (item) => item.value.toLowerCase() === ctrl.value.toLowerCase()
      )
    ) {
      this.parentForm.get(this.controlName)!.setValue(null);
      this.change();
    }
  }

  showClear() {
    return (
      this.parentForm.get(this.controlName)!.value &&
      !this.parentForm.get(this.controlName)!.disabled
    );
  }
}
