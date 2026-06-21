import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
  ModalController,
  IonIcon,
  IonRippleEffect,
  IonList,
  IonBadge,
} from '@ionic/angular/standalone';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SortingComponent } from 'src/app/search/sorting/sorting.component';
import { FilterComponent } from 'src/app/search/filter/filter.component';
import { ClothesStatus, Filters } from '@trokai/shared-core';

import { addIcons } from 'ionicons';
import { filterOutline, reorderTwoOutline, trash } from 'ionicons/icons';
import { ToastService } from 'src/app/services/toast-service';

@Component({
  selector: 'app-filter-tags',
  templateUrl: './filter-tags.component.html',
  styleUrls: ['./filter-tags.component.scss'],
  standalone: true,
  imports: [
    IonBadge,
    IonList,
    IonRippleEffect,
    IonIcon,
    MatFormFieldModule,
    MatSelectModule,
  ],
})
export class FilterTagsComponent {
  @Output() filtersChanged = new EventEmitter<Filters>();
  @Input() filters?: Filters;
  @Input() enableSorting = true;
  @Input() statusFilter = undefined;
  @Input() enableStatusFilter = true;

  private toastService = inject(ToastService);
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ filterOutline, reorderTwoOutline, trash });
  }

  clearFilters() {
    this.filters = new Filters({ status: this.filters?.status });
    // if (!this.statusFilter?.length) this.filters.status = null;
    this.filtersChanged.emit(this.filters);
    this.toastService.makeToast('Filtros removidos');
  }

  getSortingText() {
    switch (this.filters?.sorting) {
      case 'relevance':
        return 'Em destaque';
      case 'recent':
        return 'Mais recente';
      case 'cost':
        return 'Mais barato';
      case 'distanceHome':
        return 'Meu endereço';
      case 'distanceGPS':
        return 'Minha localização';
    }
  }

  async openSortingAction() {
    const modal = await this.modalCtrl.create({
      component: SortingComponent,
      componentProps: {
        sorting: this.filters?.sorting,
      },
      cssClass: 'modal-60',
    });

    modal.present();

    const ret = await modal.onDidDismiss();

    if (ret && ret.data && ret.data.sorted) {
      this.selectSorting(ret.data.sorted);
    }
  }

  selectSorting(order) {
    this.filters.sorting = order;
    this.filtersChanged.emit(this.filters);
  }

  changeStatusFilter(status: ClothesStatus) {
    this.filters.status = status;
    this.filtersChanged.emit(this.filters);
  }

  openFilterModal() {
    if (!this.filters) return;

    this.modalCtrl
      .create({
        component: FilterComponent,
        componentProps: {
          filter: this.filters,
        },
        cssClass: 'modal-95',
      })
      .then((modalEl) => {
        // this.isSelecting.emit(true);
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((res) => {
        if (!res || !res.data) return;
        if (!res.data.filtersChanged) return;
        this.filters = res.data.filters;
        this.filtersChanged.emit(this.filters);
      });
  }
}
