import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
export class Paginator {
  activePage: number;
  numOfPages: number;

  constructor(activePage: number, numOfPages: number) {
    this.activePage = activePage;
    this.numOfPages = numOfPages;
  }
}

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
})
export class PaginatorComponent implements OnInit, OnChanges {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @Input() paginator!: Paginator;

  nextEnabled = true;
  previousEnabled = true;

  params: { [key: string]: string } = {};

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = { ...params };
    });
  }

  next() {
    // console.log(this.route);

    this.params.page = (this.paginator.activePage + 1).toString();

    const path = this.route.snapshot.url
      .map((segment) => segment.path)
      .join('/');

    this.router.navigate([`/${path}`], { queryParams: this.params });
  }

  previous() {
    this.params.page = (this.paginator.activePage - 1).toString();

    const path = this.route.snapshot.url
      .map((segment) => segment.path)
      .join('/');

    this.router.navigate([`/${path}`], { queryParams: this.params });
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.paginator) return;

    this.previousEnabled = this.paginator.activePage > 1;
    this.nextEnabled = this.paginator.activePage < this.paginator.numOfPages;
  }
}
