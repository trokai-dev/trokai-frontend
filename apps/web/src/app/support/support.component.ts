import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss',
})
export class SupportComponent {}
