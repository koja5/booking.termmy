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
import { ToastrComponent } from 'src/app/common/toastr/toastr.component';
import { TranslateService } from '@ngx-translate/core';

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
  public amount: any;

  constructor(
    private _service: CallApiService,
    private _storageService: StorageService,
    private _activatedRouter: ActivatedRoute,
    private _router: Router,
    private _toastr: ToastrComponent,
    private _translate: TranslateService
  ) {}

  ngOnInit() {
    this.queryParams = this._activatedRouter.snapshot.queryParams;
    this.getSelectedAppointmentValue();
    this.getClientData();
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
            this.amount = this.appointment.service.price;
            this.createPaymentIntent(this.amount);
            this._storageService.setAppointmentToCookie(
              'service',
              this.appointment.service
            );
          }
        });
    } else {
      this.amount = this.appointment.service.price;
      this.createPaymentIntent(this.amount);
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

  getConfig() {
    this.config = this._storageService.getCookie('config');
    if (!this.config) {
      const id = this._activatedRouter.snapshot.params.id;
      this._service
        .callGetMethod('/api/booking/getBusinessConfig', id)
        .subscribe((data: any) => {
          if (data && data.length) {
            this.config = data[0];
            this._storageService.setCookie('conifig', this.config);
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

  createPaymentIntent(amount: number) {
    this.amount = amount;
    this._service
      .callPostMethod('api/payment/createPaymentIntent', {
        amount: this.amount,
      })
      .subscribe((data) => {
        this.elementsOptions.clientSecret = data as string;
      });
  }

  setStripeToken(token: stripe.Token) {}

  onStripeError(error: any) {}

  payAndBooked() {
    this.submitted = true;
    if (this.paying || this.clientData.invalid) return;
    this.paying = true;

    const { firstname, lastname, email, telephone } =
      this.clientData.getRawValue();

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

  payOnArrival() {
    this.submitted = true;
    if (this.paying || this.clientData.invalid) return;
    this.paying = true;

    if (!this.accept) {
      this.paying = false;
      return;
    }

    this.makeAppointment();
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
    if (this.appointment.employee.google) {
      this.createAppointmentToGoogleCalendar(
        client_id,
        this.queryParams.employee
      );
    } else {
      this.createAppointmentToDatabase(client_id, this.queryParams.employee);
    }
  }

  createAppointmentToDatabase(client_id: number, employee_id: number) {
    let data = this.packAppointmentDataForCreating(client_id, employee_id);

    data['externalCalendar'] = this.appointment.employee.google;

    this._service
      .callPostMethod('/api/booking/createAppointment', data)
      .subscribe((appointment_id: any) => {
        if (appointment_id) {
          this.createAppointmentArchive(client_id, employee_id, appointment_id);
        } else {
          this._toastr.showWarningCustom(
            this._translate.instant('payment.appointmentIsClosed')
          );
          this._router.navigate([this._activatedRouter.snapshot.params.id], {
            queryParams: { service: this.queryParams.service },
          });
        }
      });
  }

  createAppointmentToGoogleCalendar(client_id: number, employee_id: number) {
    const data = this.packAppointmentDataForCreating(client_id, employee_id);

    this._service
      .callPostMethod('/api/google/createAppointment', data)
      .subscribe((data: any) => {
        if (data) {
          this.createAppointmentArchive(client_id, employee_id, null);
        } else {
          this._toastr.showWarningCustom(
            this._translate.instant('payment.appointmentIsClosed')
          );
          this._router.navigate([this._activatedRouter.snapshot.params.id], {
            queryParams: { service: this.queryParams.service },
          });
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
      EndTime: moment(this.queryParams.appointment)
        .add(this.appointment.service.time_blocked, 'minutes')
        .utc(),
      is_online: !this.isCollapsePayByCreditCard,
      amount_paid: !this.isCollapsePayByCreditCard ? this.amount : 0,
    };
    if (this.appointment.employee.google) {
      data.externalCalendar = this.appointment.employee.google;
    }

    return data;
  }
  createAppointmentArchive(
    client_id: number,
    employee_id: number,
    appointment_id?: any
  ) {
    const data = {
      appointment_id: appointment_id,
      admin_id: employee_id,
      employee_id: employee_id,
      client_id: client_id,
      service_id: this.queryParams.service,
      StartTime: this.queryParams.appointment,
      EndTime: moment(this.queryParams.appointment).add(
        this.appointment.service.time_blocked,
        'minutes'
      ),
    };

    this._service
      .callPostMethod('/api/booking/createAppointmentArchive', data)
      .subscribe(
        (data) => {
          if (data) {
            this.paying = false;
            this._storageService.removeCookie('appointment');
            this._router.navigate(
              [this._activatedRouter.snapshot.params.id + '/scheduled/' + data],
              {
                queryParams: {
                  payment: this._storageService.encrypt({
                    type: !this.isCollapsePayByCreditCard
                      ? 'paid'
                      : 'on-arrival',
                    amount: !this.isCollapsePayByCreditCard ? this.amount : 0,
                  }),
                },
              }
            );
            this.sendAppointmentConfirmationToMail(data);
          }
        },
        (error) => {
          this.paying = false;
        }
      );
  }

  sendAppointmentConfirmationToMail(data: any) {
    this._service
      .callPostMethod('/api/mail-server/appointmentConfirmation', {
        appointment_id: data,
        payment_message: this.generatePaymentMessage(),
      })
      .subscribe((data) => {
        console.log(data);
      });
  }

  generatePaymentMessage() {
    if (!this.isCollapsePayByCreditCard) {
      return this._translate
        .instant('payment.paidDirectly')
        .replace('{amount}', this.amount);
    } else {
      return this._translate.instant('payment.paidUponArrival');
    }
  }

  replaceForFullAmount(text: string) {
    return text.replace('{amount}', this.appointment.service.price);
  }

  replaceForPartOfAmount(text: string) {
    return text.replace(
      '{amount}',
      (this.appointment.service.price / 2).toString()
    );
  }

  replaceButtonText(text: string) {
    return text.replace('{amount}', this.amount);
  }
}
