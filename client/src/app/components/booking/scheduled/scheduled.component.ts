import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CallApiService } from 'src/app/services/call-api.service';
import { StorageService } from 'src/app/services/storage.service';
import * as moment from 'moment';

@Component({
  selector: 'app-scheduled',
  templateUrl: './scheduled.component.html',
  styleUrls: ['./scheduled.component.scss'],
})
export class ScheduledComponent {
  public config: any;
  public appointment: any;
  public queryParams: any;
  public paidMessage!: string;

  constructor(
    private _service: CallApiService,
    private _router: Router,
    private _activatedRouter: ActivatedRoute,
    private host: ElementRef<HTMLElement>,
    private _storageService: StorageService,
    private _translate: TranslateService
  ) {}

  ngOnInit() {
    // this.sendAppointmentConfirmationToMail(null);
    const id = this._activatedRouter.snapshot.params.id;
    const appointment_id = this._activatedRouter.snapshot.params.appointmentId;
    this.queryParams = this._storageService.decrypt(
      this._activatedRouter.snapshot.queryParams.payment
    );
    this._service
      .callGetMethod('/api/booking/getBusinessConfig', id)
      .subscribe((data: any) => {
        if (data && data.length) {
          this.config = data[0];
          this.setBusinessColor();
        }
      });
    this._service
      .callGetMethod('/api/booking/getAppointmentArchive', appointment_id)
      .subscribe((data: any) => {
        if (data.length) {
          this.appointment = data[0];
          this.appointment.EndTimeTherapy = moment(
            this.appointment.StartTime
          ).add(this.appointment.time_duration, 'minutes');
          this.generateMessage();
        }
      });
  }

  generateMessage() {
    if (this.queryParams.amount < this.appointment.price) {
      this.paidMessage = this._translate
        .instant('scheduled.paidPartOfAmount')
        .replace('{amount}', this.queryParams.amount);
    } else {
      this.paidMessage = this._translate
        .instant('scheduled.paidFullAmount')
        .replace('{amount}', this.queryParams.amount);
    }
  }

  setBusinessColor() {
    if (this.config.branding_color_primary) {
      this.host.nativeElement.style.setProperty(
        `--primary`,
        this.config.branding_color_primary
      );
    }

    if (this.config.branding_color_secondary) {
      this.host.nativeElement.style.setProperty(
        `--secondary`,
        this.config.branding_color_secondary
      );
    }

    if (this.config.branding_color_light) {
      this.host.nativeElement.style.setProperty(
        `--light`,
        this.config.branding_color_light
      );
    }

    if (this.config.branding_color_dark) {
      this.host.nativeElement.style.setProperty(
        `--dark`,
        this.config.branding_color_dark
      );
    }

    if (this.config.background_color_primary) {
      this.host.nativeElement.style.setProperty(
        `--background-color-primary`,
        this.config.background_color_primary
      );
    }

    if (this.config.background_color_secondary) {
      this.host.nativeElement.style.setProperty(
        `--background-color-secondary`,
        this.config.background_color_secondary
      );
    }
  }

  sendAppointmentConfirmationToMail(data: any) {
    this._service
      .callPostMethod('/api/mail-server/appointmentConfirmation', {
        appointment_id: '6dd2738c-3472-4fb5-823e-1a6821d3310e',
      })
      .subscribe((data) => {
        console.log(data);
      });
  }

  bookAnotherTermine() {
    this._router.navigate([this._activatedRouter.snapshot.params.id]);
  }
}
