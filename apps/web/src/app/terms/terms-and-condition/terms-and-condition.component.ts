import { Component, OnInit, inject } from '@angular/core';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-terms-and-condition',
  templateUrl: './terms-and-condition.component.html',
  styleUrls: ['./terms-and-condition.component.scss'],
  standalone: true,
})
export class TermsAndConditionComponent implements OnInit {
  private globalService = inject(GlobalService);

  ngOnInit(): void {
    this.globalService.setTitle('Termos de uso');
  }
}
