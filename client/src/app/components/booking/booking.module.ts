import { NgModule } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { BookingComponent } from './booking.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SelectTimeComponent } from './select-time/select-time.component';
import { ProfileCompanyComponent } from './common/profile-company/profile-company.component';
import { SelectServiceComponent } from './select-service/select-service.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BackButtonComponent } from './common/back-button/back-button.component';
import { PreviewInformationComponent } from './common/preview-information/preview-information.component';
import { ClientFormComponent } from './client-form/client-form.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectPaymentComponent } from './select-payment/select-payment.component';
import { PreviewBookingInformationComponent } from './common/preview-booking-information/preview-booking-information.component';
import { StripeModule } from 'stripe-angular';
import { environment } from '../../../environments/environment.prod';
import { LoaderComponent } from './common/loader/loader.component';
import { NgxStripeModule, provideNgxStripe } from 'ngx-stripe';
import { LoaderSmallComponent } from './common/loader-small/loader-small.component';
import { ScheduledComponent } from './scheduled/scheduled.component';
import { CommonCustomModule } from 'src/app/common/common-custom.module';

const routes = [
  {
    path: '',
    component: BookingComponent,
  },
  {
    path: 'scheduled/:appointmentId',
    component: ScheduledComponent,
  },
];

@NgModule({
  declarations: [
    BookingComponent,
    SelectTimeComponent,
    ProfileCompanyComponent,
    SelectServiceComponent,
    BackButtonComponent,
    PreviewInformationComponent,
    ClientFormComponent,
    SelectPaymentComponent,
    PreviewBookingInformationComponent,
    LoaderComponent,
    LoaderSmallComponent,
    ScheduledComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(routes),
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    StripeModule.forRoot(environment.STRIPE_KEY),
    NgxStripeModule.forRoot(environment.STRIPE_KEY),
    CommonCustomModule,
  ],
  providers: [],
  bootstrap: [],
  exports: [],
})
export class BookingModule {}
