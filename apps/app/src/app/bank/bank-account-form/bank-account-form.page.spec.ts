import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BankAccountFormPage } from './bank-account-form.page';

describe('BankAccountFormPage', () => {
  let component: BankAccountFormPage;
  let fixture: ComponentFixture<BankAccountFormPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(BankAccountFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
