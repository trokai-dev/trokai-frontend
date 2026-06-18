import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChangeZipcodeComponent } from './change-zipcode.component';

describe('ChangeZipcodeComponent', () => {
  let component: ChangeZipcodeComponent;
  let fixture: ComponentFixture<ChangeZipcodeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ChangeZipcodeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeZipcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
