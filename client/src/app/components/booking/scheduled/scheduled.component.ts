import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CallApiService } from 'src/app/services/call-api.service';

@Component({
  selector: 'app-scheduled',
  templateUrl: './scheduled.component.html',
  styleUrls: ['./scheduled.component.scss'],
})
export class ScheduledComponent {
  public config: any;
  public appointment: any;

  constructor(
    private _service: CallApiService,
    private _activatedRouter: ActivatedRoute,
    private host: ElementRef<HTMLElement>
  ) {}

  ngOnInit() {
    const id = this._activatedRouter.snapshot.params.id;
    const appointment_id = this._activatedRouter.snapshot.params.appointmentId;
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
        }
      });
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
  }
}
