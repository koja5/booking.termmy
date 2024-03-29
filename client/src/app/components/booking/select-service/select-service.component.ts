import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallApiService } from 'src/app/services/call-api.service';

@Component({
  selector: 'app-select-service',
  templateUrl: './select-service.component.html',
  styleUrls: ['./select-service.component.scss'],
})
export class SelectServiceComponent {
  @Input() config: any;
  public services: any;

  constructor(
    private _service: CallApiService,
    private _activatedRouter: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    const id = this._activatedRouter.snapshot.params.id;
    this._service
      .callGetMethod('/api/booking/getServices', id)
      .subscribe((data: any) => {
        if (data.length > 1) {
          this.services = data;
        } else if (data.length === 1) {
          this.selectService(data[0]);
        }
      });
  }

  selectService(service: any) {
    this._router.navigate([this._activatedRouter.snapshot.params.id], {
      queryParams: { service: service.name, price: service.price, time: service.time_duration },
    });
  }
}
