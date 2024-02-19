import { Component, Input, ViewChild } from '@angular/core';
import { Appearance, StripeElementsOptions } from '@stripe/stripe-js';
import { StripePaymentElementComponent, injectStripe } from 'ngx-stripe';
import { CallApiService } from 'src/app/services/call-api.service';
import { StripeCard } from 'stripe-angular';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment.prod';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-select-payment',
  templateUrl: './select-payment.component.html',
  styleUrls: ['./select-payment.component.scss'],
})
export class SelectPaymentComponent {
  @ViewChild(StripePaymentElementComponent)
  paymentElement!: StripePaymentElementComponent;
  @Input() config: any;

  public isCollapsePayByCreditCard = false;
  public isCollapsePayOnArrival = true;
  public elementsOptions: StripeElementsOptions = {
    locale: 'en',
  };
  readonly stripe = injectStripe(environment.STRIPE_KEY, {
    stripeAccount: 'acct_1OhSOVPwkZNY6HKT',
  });
  appearance: Appearance = {
    theme: 'stripe',
    labels: 'floating',
    variables: {
      colorPrimary: '#673ab7',
    },
  };
  public paying = false;
  public submitted = false;
  clientData = new FormGroup({
    firstname: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    telephone: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.Austria,
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
  ];
  public queryParams: any;
  public appointment: any;
  public accept = false;

  constructor(
    private _service: CallApiService,
    private _storageService: StorageService,
    private _activatedRouter: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit() {
    this.queryParams = this._activatedRouter.snapshot.queryParams;
    this.getSelectedAppointmentValue();
    this.getClientData();
    this.createPaymentIntent();
  }

  getSelectedAppointmentValue() {
    this.appointment = this._storageService.getAppointmentFromCookie() ?? {};
    if (!this.appointment || !this.appointment.service) {
      this._service
        .callGetMethod(
          '/api/booking/getService',
          this._activatedRouter.snapshot.queryParams.service
        )
        .subscribe((data: any) => {
          if (data.length) {
            this.appointment.service = data[0];
            this._storageService.setAppointmentToCookie(
              'service',
              this.appointment.service
            );
          }
        });
    }

    if (!this.appointment || !this.appointment.employee) {
      this._service
        .callGetMethod(
          '/api/booking/getEmployee',
          this._activatedRouter.snapshot.queryParams.employee
        )
        .subscribe((data: any) => {
          if (data.length) {
            this.appointment.employee = data[0];
            this._storageService.setAppointmentToCookie(
              'employee',
              this.appointment.employee
            );
          }
        });
    }
  }

  getClientData() {
    const bookingValue = this._storageService.getAppointmentFromCookie();
    if (bookingValue && bookingValue.client) {
      this.clientData.setValue(bookingValue.client);
    }
  }

  createPaymentIntent() {
    this._service
      .callPostMethod('api/payment/createPaymentIntent', {})
      .subscribe((data) => {
        this.elementsOptions.clientSecret = data as string;
      });
  }

  setStripeToken(token: stripe.Token) {
    console.log(token);
  }

  onStripeError(error: any) {
    // this.toastr.showErrorCustom(this.language.paymentCardIsNotValid);
  }

  // payAndBooked() {
  //   this.stripeCard.createToken();
  // }

  payAndBooked() {
    this.submitted = true;
    if (this.paying || this.clientData.invalid) return;
    this.paying = true;

    const { firstname, lastname, email, telephone } =
      this.clientData.getRawValue();

    // this.stripe.createPaymentMethod

    this.stripe
      .confirmPayment({
        elements: this.paymentElement.elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: (firstname + ' ' + lastname) as string,
              email: email as string,
              phone: Object(telephone).internationalNumber,
            },
          },
        },
        redirect: 'if_required',
      })
      .subscribe({
        next: (result) => {
          if (result.error || !this.accept) {
            this.paying = false;
          } else if (result.paymentIntent.status === 'succeeded') {
            this.submitted = false;
            this.makeAppointment();
          }
        },
        error: (err) => {
          this.paying = false;
          this.submitted = false;
        },
      });
  }

  makeAppointment() {
    const data = {
      booking_link: this._activatedRouter.snapshot.params.id,
      client: this.clientData.value,
    };
    this._service
      .callPostMethod('/api/booking/createClient', data)
      .subscribe((client_id: any) => {
        this.saveAppointment(client_id);
      });
  }

  saveAppointment(client_id: number) {
    // this.createAppointmentToDatabase(client_id, this.queryParams.employee);
    this.createAppointmentToGoogleCalendar(
      client_id,
      this.queryParams.employee
    );
    // if (!employee.externalCalendarConnections) {
    // } else {
    //   if (employee.externalCalendarConnections.google) {
    //   }
    // }
  }

  createAppointmentToDatabase(client_id: number, employee_id: number) {
    let data = this.packAppointmentDataForCreating(client_id, employee_id);

    data['externalCalendar'] = this.appointment.employee.google;

    this._service
      .callPostMethod('/api/booking/createAppointment', data)
      .subscribe((data: any) => {
        if (data) {
          this.createAppointmentArchive(client_id, employee_id);
        }
      });
  }

  createAppointmentToGoogleCalendar(client_id: number, employee_id: number) {
    const data = this.packAppointmentDataForCreating(client_id, employee_id);

    this._service
      .callPostMethod('/api/google/createAppointment', data)
      .subscribe((data: any) => {
        if (data) {
          this.createAppointmentArchive(client_id, employee_id);
        }
      });
  }

  packAppointmentDataForCreating(client_id: number, employee_id: number) {
    let data: any = {
      admin_id: employee_id,
      employee_id: employee_id,
      client_id: client_id,
      service_id: this.queryParams.service,
      Subject:
        this.queryParams.client ??
        this.clientData?.get('firstname')!.value +
          this.clientData.get('lastname')?.get('lastname')!.value,
      ResourcesIndex: employee_id,
      StartTime: moment(this.queryParams.appointment).utc(),
      EndTime: moment(this.queryParams.appointment).add(
        this.appointment.service.time_duration,
        'minutes'
      ).utc(),
    };
    if (this.appointment.employee.google) {
      data.externalCalendar = this.appointment.employee.google;
    }

    return data;
  }
  createAppointmentArchive(client_id: number, employee_id: number) {
    const data = {
      admin_id: employee_id,
      employee_id: employee_id,
      client_id: client_id,
      service_id: this.queryParams.service,
      StartTime: this.queryParams.appointment,
      EndTime: moment(this.queryParams.appointment).add(
        this.appointment.service.time_duration,
        'minutes'
      ),
    };

    this._service
      .callPostMethod('/api/booking/createAppointmentArchive', data)
      .subscribe(
        (data) => {
          if (data) {
            this.paying = false;
            this._router.navigate([
              this._activatedRouter.snapshot.params.id + '/scheduled/' + data,
            ]);
          }
        },
        (error) => {
          this.paying = false;
        }
      );
  }
}
