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
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectPaymentComponent } from './select-payment/select-payment.component';
import { PreviewBookingInformationComponent } from './common/preview-booking-information/preview-booking-information.component';
import { StripeModule } from 'stripe-angular';
import { environment } from '../../../environments/environment.prod';
import { LoaderComponent } from './common/loader/loader.component';

const routes = [
  {
    path: '',
    component: BookingComponent,
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
    CustomerFormComponent,
    SelectPaymentComponent,
    PreviewBookingInformationComponent,
    LoaderComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(routes),
    NgbModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    StripeModule.forRoot(environment.STRIPE_KEY),
  ],
  providers: [],
  bootstrap: [],
  exports: [],
})
export class BookingModule {}
