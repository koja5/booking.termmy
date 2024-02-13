import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent {
  @Input() config: any;

  constructor(
    private _router: Router,
    private _activatedRouter: ActivatedRoute,
    private _storageService: StorageService
  ) {}

  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.Austria,
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
  ];
  data = new FormGroup({
    firstname: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });
  public submited = false;

  ngOnInit() {
    if (this._storageService.getSessionStorage('customer')) {
      this.data.setValue(this._storageService.getSessionStorage('customer'));
    }
  }

  changePreferredCountries() {
    this.preferredCountries = [CountryISO.India, CountryISO.Canada];
  }

  submitForm(event: any) {
    this.submited = true;
    if (this.data.valid) {
      this._storageService.setSessionStorage('customer', this.data.value);
      this.navigateToNextStep();
    }
  }

  navigateToNextStep() {
    this._router.navigate(['.'], {
      relativeTo: this._activatedRouter.parent,
      queryParams: {
        customer: this.data.value.firstname + ' ' + this.data.value.lastname,
      },
      queryParamsHandling: 'merge',
    });
  }
}
