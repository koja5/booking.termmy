import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewInformationComponent } from './preview-information.component';

describe('PreviewInformationComponent', () => {
  let component: PreviewInformationComponent;
  let fixture: ComponentFixture<PreviewInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreviewInformationComponent]
    });
    fixture = TestBed.createComponent(PreviewInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
