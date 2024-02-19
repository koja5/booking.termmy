import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CallApiService } from 'src/app/services/call-api.service';
import { StorageService } from 'src/app/services/storage.service';
import * as moment from 'moment';

@Component({
  selector: 'app-preview-information',
  templateUrl: './preview-information.component.html',
  styleUrls: ['./preview-information.component.scss'],
})
export class PreviewInformationComponent {
  @Input() config: any;

  public data: any;
  public appointment: any = {};
  public endTime: any;

  constructor(
    private _activatedRouter: ActivatedRoute,
    private _storageService: StorageService,
    private _service: CallApiService
  ) {}

  ngOnInit() {
    this.appointment = this._storageService.getAppointmentFromCookie()
      ? this._storageService.getAppointmentFromCookie()
      : {};

    this._activatedRouter.queryParams.subscribe((data) => {
      this.data = data;
      this.checkFromCache();
    });
  }

  checkFromCache() {
    if (!this.appointment || !this.appointment.service) {
      this._service
        .callGetMethod('/api/booking/getService', this.data.service)
        .subscribe((data: any) => {
          if (data.length) {
            this.appointment.service = data[0];
            this._storageService.setAppointmentToCookie(
              'service',
              this.appointment.service
            );
            this.setEndTime();
          }
        });
    } else {
      this.setEndTime();
    }
  }

  setEndTime() {
    this.endTime = moment(this.data.appointment).add(
      this.appointment.service.time_duration,
      'minutes'
    );
  }
}
