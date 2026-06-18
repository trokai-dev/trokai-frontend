import { Directive, ElementRef, HostListener, inject } from '@angular/core';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[hideLoading]', standalone: true })
export class HideLoadingImageDirective {
  private el = inject(ElementRef);

  @HostListener('error') load() {
    this.el.nativeElement.style.visibility = 'hidden';
  }
}
