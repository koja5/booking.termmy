import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-preview-information',
  templateUrl: './preview-information.component.html',
  styleUrls: ['./preview-information.component.scss'],
})
export class PreviewInformationComponent {
  @Input() config: any;

  public data: any;

  constructor(private _activatedRouter: ActivatedRoute) {}

  ngOnInit() {
    this._activatedRouter.queryParams.subscribe((data) => {
      this.data = data;
    });
  }
}
