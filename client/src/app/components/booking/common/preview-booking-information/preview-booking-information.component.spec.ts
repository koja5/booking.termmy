import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewBookingInformationComponent } from './preview-booking-information.component';

describe('PreviewBookingInformationComponent', () => {
  let component: PreviewBookingInformationComponent;
  let fixture: ComponentFixture<PreviewBookingInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreviewBookingInformationComponent]
    });
    fixture = TestBed.createComponent(PreviewBookingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
