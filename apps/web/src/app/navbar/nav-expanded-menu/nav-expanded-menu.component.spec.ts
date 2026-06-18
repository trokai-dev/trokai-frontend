import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavExpandedMenuComponent } from './nav-expanded-menu.component';

describe('NavExpandedMenuComponent', () => {
  let component: NavExpandedMenuComponent;
  let fixture: ComponentFixture<NavExpandedMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavExpandedMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavExpandedMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
