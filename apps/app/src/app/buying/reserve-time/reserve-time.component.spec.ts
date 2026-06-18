import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReserveTimeComponent } from './reserve-time.component';

describe('ReserveTimeComponent', () => {
  let component: ReserveTimeComponent;
  let fixture: ComponentFixture<ReserveTimeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ReserveTimeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReserveTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
