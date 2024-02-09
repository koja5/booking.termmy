import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCompanyComponent } from './profile-company.component';

describe('ProfileCompanyComponent', () => {
  let component: ProfileCompanyComponent;
  let fixture: ComponentFixture<ProfileCompanyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileCompanyComponent]
    });
    fixture = TestBed.createComponent(ProfileCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
