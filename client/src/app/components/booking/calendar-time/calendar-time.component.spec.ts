import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarTimeComponent } from './calendar-time.component';

describe('CalendarTimeComponent', () => {
  let component: CalendarTimeComponent;
  let fixture: ComponentFixture<CalendarTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalendarTimeComponent]
    });
    fixture = TestBed.createComponent(CalendarTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
