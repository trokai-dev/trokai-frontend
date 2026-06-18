import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLinkActive, RouterLink } from '@angular/router';

import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-menu-orders',
  templateUrl: './menu-orders.component.html',
  styleUrls: ['./menu-orders.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [RouterLinkActive, MatMenuModule, RouterLink],
})
export class MenuOrdersComponent {
  private dialogService = inject(DialogService);

  items = [
    {
      text: 'Compras',
      icon: 'bag-outline',
      route: 'purchases',
    },
    {
      text: 'Vendas',
      icon: 'cash-outline',
      route: 'sales',
    },
  ];

  async openDownloadModal() {
    this.dialogService.openDownloadModal();
  }
}
