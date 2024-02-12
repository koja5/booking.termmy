import { NgModule } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { BookingComponent } from './booking.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CalendarTimeComponent } from './calendar-time/calendar-time.component';
import { ProfileCompanyComponent } from './common/profile-company/profile-company.component';
import { SelectServiceComponent } from './select-service/select-service.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BackButtonComponent } from './common/back-button/back-button.component';
import { PreviewInformationComponent } from './common/preview-information/preview-information.component';
import { CustomerDataComponent } from './customer-data/customer-data.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { ReactiveFormsModule } from '@angular/forms';

const routes = [
  {
    path: '',
    component: BookingComponent,
  },
];

@NgModule({
  declarations: [
    BookingComponent,
    CalendarTimeComponent,
    ProfileCompanyComponent,
    SelectServiceComponent,
    BackButtonComponent,
    PreviewInformationComponent,
    CustomerDataComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(routes),
    NgbModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
  ],
  providers: [],
  bootstrap: [],
  exports: [],
})
export class BookingModule {}
