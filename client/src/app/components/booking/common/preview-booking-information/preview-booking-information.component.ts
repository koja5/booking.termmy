import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-preview-booking-information',
  templateUrl: './preview-booking-information.component.html',
  styleUrls: ['./preview-booking-information.component.scss'],
})
export class PreviewBookingInformationComponent {
  public client: any;
  public queryParams: any;

  constructor(
    private _storageSerice: StorageService,
    private _activatedRouter: ActivatedRoute
  ) {}

  ngOnInit() {
    this.client = this._storageSerice.getSessionStorage('client');
    this.queryParams = this._activatedRouter.snapshot.queryParams;
  }
}
