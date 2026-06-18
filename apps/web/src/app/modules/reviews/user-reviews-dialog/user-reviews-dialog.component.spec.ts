import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReviewsDialogComponent } from './user-reviews-dialog.component';

describe('UserReviewsDialogComponent', () => {
  let component: UserReviewsDialogComponent;
  let fixture: ComponentFixture<UserReviewsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserReviewsDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserReviewsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
