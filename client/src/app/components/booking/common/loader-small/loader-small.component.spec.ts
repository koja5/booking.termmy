import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderSmallComponent } from './loader-small.component';

describe('LoaderSmallComponent', () => {
  let component: LoaderSmallComponent;
  let fixture: ComponentFixture<LoaderSmallComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoaderSmallComponent]
    });
    fixture = TestBed.createComponent(LoaderSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
