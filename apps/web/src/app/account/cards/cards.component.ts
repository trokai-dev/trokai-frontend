import { Component } from '@angular/core';
import { FormCardComponent } from '../../modules/form-card/form-card.component';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  standalone: true,
  imports: [FormCardComponent],
})
export class CardsComponent {}
