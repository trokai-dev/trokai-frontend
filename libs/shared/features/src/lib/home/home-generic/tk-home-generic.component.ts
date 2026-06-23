import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TkProductCardComponent } from '@trokai/shared-ui';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { HomePayloadRow } from '@trokai/shared-core';

/**
 * Home carousel tile/card renderer (canonical web markup). `useLink` selects the
 * navigation strategy like TkProductCardComponent: web renders SEO `routerLink`/
 * `href`; app passes `useLink=false` and handles `(navigate)` via its shell.
 */
@Component({
  selector: 'tk-home-generic',
  templateUrl: './tk-home-generic.component.html',
  styleUrl: './tk-home-generic.component.scss',
  standalone: true,
  imports: [RouterLink, TkProductCardComponent, NgOptimizedImage],
})
export class TkHomeGenericComponent {
  @Input() home_generic!: HomePayloadRow;
  @Input() home_row!: HomePayloadRow;
  @Input() childClass = '';
  @Input() viewportHeight = 0;
  /** Web: navigate via the rendered `routerLink`/`href`. App: false → emit `(navigate)`. */
  @Input() useLink = true;

  @Output() navigate = new EventEmitter<void>();
}
