import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavUserMenuComponent } from './nav-user-menu.component';

describe('NavUserMenuComponent', () => {
  let component: NavUserMenuComponent;
  let fixture: ComponentFixture<NavUserMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavUserMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavUserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
