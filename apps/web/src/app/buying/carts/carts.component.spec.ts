import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartsComponent } from './carts.component';

describe('CartsComponent', () => {
  let component: CartsComponent;
  let fixture: ComponentFixture<CartsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CartsComponent],
    });
    fixture = TestBed.createComponent(CartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
