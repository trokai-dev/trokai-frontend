import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeGenericComponent } from './home-generic.component';

describe('HomeGenericComponent', () => {
  let component: HomeGenericComponent;
  let fixture: ComponentFixture<HomeGenericComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HomeGenericComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
