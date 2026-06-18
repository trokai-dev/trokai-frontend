import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AuthRootPage } from './auth-root.page';

describe('AuthRootPage', () => {
  let component: AuthRootPage;
  let fixture: ComponentFixture<AuthRootPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), AuthRootPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthRootPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
