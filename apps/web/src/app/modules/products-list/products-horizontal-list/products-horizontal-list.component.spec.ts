import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsHorizontalListComponent } from './products-horizontal-list.component';

describe('ProductsHorizontalListComponent', () => {
  let component: ProductsHorizontalListComponent;
  let fixture: ComponentFixture<ProductsHorizontalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsHorizontalListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsHorizontalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
