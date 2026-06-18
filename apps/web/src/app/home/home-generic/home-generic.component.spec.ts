import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeGenericComponent } from './home-generic.component';

describe('HomeGenericComponent', () => {
  let component: HomeGenericComponent;
  let fixture: ComponentFixture<HomeGenericComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeGenericComponent],
    });
    fixture = TestBed.createComponent(HomeGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
