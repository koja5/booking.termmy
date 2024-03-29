import { Component, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CallApiService } from 'src/app/services/call-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreTranslationService } from 'src/@core/services/translation.service';
import { HelpService } from 'src/app/services/help.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent {
  public config: any;
  public view: any = '';

  /**
   * Constructor
  * @param {CoreTranslationService} _coreTranslationService

*/
  constructor(
    private _coreTranslationServic: CoreTranslationService,
    private _translateService: TranslateService,
    private _service: CallApiService,
    private _activatedRouter: ActivatedRoute,
    private host: ElementRef<HTMLElement>,
    public _helpService: HelpService,
    
  ) {
    // Add languages to the translation service
    this._translateService.addLangs(['en', 'fr', 'de', 'pt']);

    // This language will be used as a fallback when a translation isn't found in the current language
    this._translateService.setDefaultLang('en');
    this._coreTranslationServic.setAllTranslations();
  }

  ngOnInit() {
    this.initialize();

    this._activatedRouter.queryParams.subscribe((data) => {
      this.view = data;
    });
  }

  initialize() {
    const id = this._activatedRouter.snapshot.params.id;
    this._service
      .callGetMethod('/api/booking/getBusinessConfig', id)
      .subscribe((data: any) => {
        if (data && data.length) {
          this.config = data[0];
          this.setBusinessColor();
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
