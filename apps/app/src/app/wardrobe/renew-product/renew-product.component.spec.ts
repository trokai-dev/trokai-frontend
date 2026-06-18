import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RenewProductComponent } from './renew-product.component';

describe('RenewProductComponent', () => {
  let component: RenewProductComponent;
  let fixture: ComponentFixture<RenewProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), RenewProductComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RenewProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
