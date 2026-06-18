import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductsHorizontalListComponent } from './products-horizontal-list.component';

describe('ProductsHorizontalListComponent', () => {
  let component: ProductsHorizontalListComponent;
  let fixture: ComponentFixture<ProductsHorizontalListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ProductsHorizontalListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsHorizontalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
