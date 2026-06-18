import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreOptionsComponent } from './store-options.component';

describe('StoreOptionsComponent', () => {
  let component: StoreOptionsComponent;
  let fixture: ComponentFixture<StoreOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreOptionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
