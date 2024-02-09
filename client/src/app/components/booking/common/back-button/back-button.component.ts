import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { HelpService } from 'src/app/services/help.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
})
export class BackButtonComponent {

  public view: any;

  constructor(private _location: Location, public _helpService: HelpService, private _activatedRouter: ActivatedRoute) {}

  ngOnInit() {
    this._activatedRouter.queryParams.subscribe((data) => {
      this.view = data;
    });
  }

  backToPreviousPage() {
    this._location.back();
  }
}
