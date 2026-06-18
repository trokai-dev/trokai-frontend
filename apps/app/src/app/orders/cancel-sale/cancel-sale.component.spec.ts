import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CancelSaleComponent } from './cancel-sale.component';

describe('CancelSaleComponent', () => {
  let component: CancelSaleComponent;
  let fixture: ComponentFixture<CancelSaleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CancelSaleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CancelSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
