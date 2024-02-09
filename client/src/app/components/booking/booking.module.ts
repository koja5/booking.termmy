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

const routes = [
  {
    path: '',
    component: BookingComponent,
  },
];

@NgModule({
  declarations: [BookingComponent, CalendarTimeComponent, ProfileCompanyComponent, SelectServiceComponent, BackButtonComponent, PreviewInformationComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(routes),
    NgbModule
  ],
  providers: [],
  bootstrap: [],
  exports: [],
})
export class BookingModule {}
