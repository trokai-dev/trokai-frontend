import { Component, Input } from '@angular/core';
import { TkProductCardComponent } from '@trokai/shared-ui';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { HomePayloadRow } from '../home.component';

@Component({
  selector: 'app-home-generic',
  templateUrl: './home-generic.component.html',
  styleUrls: ['./home-generic.component.scss'],
  standalone: true,
  imports: [RouterLink, TkProductCardComponent, NgOptimizedImage],
})
export class HomeGenericComponent {
  @Input() home_generic!: HomePayloadRow;
  @Input() home_row!: HomePayloadRow;
  @Input() childClass!: string;
  @Input() viewportHeight!: number;
}
