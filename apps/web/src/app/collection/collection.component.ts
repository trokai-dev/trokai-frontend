import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Clothes } from '@trokai/shared-core';
import {
  Paginator,
  PaginatorComponent,
} from '../search/paginator/paginator.component';
import { GlobalService } from '../services/global.service';
import { SearchService } from '../search/search.service';
import { ItemsMap } from '@trokai/shared-core';
import { MatButtonModule } from '@angular/material/button';
import { TkProductCardComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    TkProductCardComponent,
    MatButtonModule,
    RouterLink,
    PaginatorComponent,
  ],
})
export class CollectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);
  private globalService = inject(GlobalService);

  results: Clothes[] = [];
  itemsMap?: ItemsMap;

  count = 0;
  collectionName = '';
  slug = '';
  limit = 60;

  paginator!: Paginator;
  activePage = 0;

  @ViewChild(PaginatorComponent) paginatorComponent!: PaginatorComponent;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.slug = params['slug'];
      this.processParams();
    });

    this.route.queryParams.subscribe((params) => {
      if (params.page) {
        this.activePage = parseInt(params.page);
        if (this.activePage > 0) this.activePage--;
      }
      this.processParams();
    });
  }

  async processParams() {
    if (!this.slug) return;

    const skip = this.activePage * this.limit;

    try {
      const res = await this.searchService.getCollection(
        this.slug,
        skip,
        this.limit,
      );

      this.results = res.clothes;
      this.count = res.count;
      this.collectionName = res.name;

      this.globalService.setTitle(res.name);
      this.globalService.setMetaDescription(
        'Confira a coleção ' + res.name + ' no Trokaí.',
      );

      this.paginator = new Paginator(
        this.activePage + 1,
        this.count / this.limit,
      );
    } catch (error) {
      console.error('Error fetching collection:', error);
      this.results = [];
      this.count = 0;
    }
  }
}
