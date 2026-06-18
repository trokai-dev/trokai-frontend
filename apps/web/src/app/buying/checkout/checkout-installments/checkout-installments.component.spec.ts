import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutInstallmentsComponent } from './checkout-installments.component';

describe('CheckoutInstallmentsComponent', () => {
  let component: CheckoutInstallmentsComponent;
  let fixture: ComponentFixture<CheckoutInstallmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutInstallmentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutInstallmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
