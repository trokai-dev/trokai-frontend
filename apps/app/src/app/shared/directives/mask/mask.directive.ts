import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Optional,
  Output,
  inject,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { NgxMaskService } from 'ngx-mask';

@Directive({
  selector: '[appMask]',
  standalone: true,
})
export class MaskDirective implements AfterViewInit {
  @Input() appMask;

  private el = inject(ElementRef<HTMLInputElement>);
  private ngControl = inject(NgControl, { optional: true });
  private mask = inject(NgxMaskService);

  ngAfterViewInit(): void {
    setTimeout(() => this.applyMask(this.el.nativeElement.value));
  }

  @HostListener('keyup', ['$event'])
  public onKeyup(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;

    if (value.length > this.appMask.length)
      this.el.nativeElement.value = value.slice(0, -1);

    this.applyMask(value);
  }

  applyMask(value) {
    if (!this.appMask) throw 'Empty mask';

    if (!value || value === '') return;

    let _mask = this.appMask;

    // CPF or CNPJ / TEL or CEL
    if (_mask.includes('||')) {
      const [first, second] = _mask.split('||');

      // deve testar sem os pontos e traços (back retorna sem mascara)
      const _first = first.match(/\d/g).join('');

      const _value = value.match(/\d/g).join('');
      _mask = _value.length > _first.length ? second : first;
    }

    const masked = this.mask.applyMask(value, _mask);

    if (masked.length !== _mask.length && this.ngControl) {
      this.ngControl.control.setErrors({ mask: true });
    }

    if (this.ngControl) this.ngControl.control.setValue(masked);
    else this.el.nativeElement.value = masked;
  }
}
