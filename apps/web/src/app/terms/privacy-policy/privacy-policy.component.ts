import { Component, OnInit, inject } from '@angular/core';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  standalone: true,
})
export class PrivacyPolicyComponent implements OnInit {
  private globalService = inject(GlobalService);

  ngOnInit(): void {
    this.globalService.setTitle('Política de Privacidade');
  }
}
