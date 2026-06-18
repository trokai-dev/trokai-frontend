import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutTotalDetailsComponent } from './checkout-total-details.component';

describe('CheckoutTotalDetailsComponent', () => {
  let component: CheckoutTotalDetailsComponent;
  let fixture: ComponentFixture<CheckoutTotalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutTotalDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutTotalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
