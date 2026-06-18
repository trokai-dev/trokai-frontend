import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShippingOptionsPage } from './shipping-options.page';

describe('ShippingOptionsPage', () => {
  let component: ShippingOptionsPage;
  let fixture: ComponentFixture<ShippingOptionsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ShippingOptionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
