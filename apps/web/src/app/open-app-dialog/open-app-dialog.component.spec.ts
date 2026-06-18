import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenAppDialogComponent } from './open-app-dialog.component';

describe('OpenAppDialogComponent', () => {
  let component: OpenAppDialogComponent;
  let fixture: ComponentFixture<OpenAppDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenAppDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenAppDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
