import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerHealthComponent } from './seller-health.component';

describe('SellerHealthComponent', () => {
  let component: SellerHealthComponent;
  let fixture: ComponentFixture<SellerHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerHealthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SellerHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
