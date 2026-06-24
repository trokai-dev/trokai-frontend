import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TkSellerHealthComponent } from './seller-health.component';

describe('TkSellerHealthComponent', () => {
  let component: TkSellerHealthComponent;
  let fixture: ComponentFixture<TkSellerHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TkSellerHealthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TkSellerHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
