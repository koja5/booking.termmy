import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CoreTranslationService } from 'src/@core/services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'booking';

  /**
   * Constructor
  * @param {CoreTranslationService} _coreTranslationService

*/
  constructor(
    private _coreTranslationServic: CoreTranslationService,
    private _translateService: TranslateService
  ) {
    // Add languages to the translation service
    this._translateService.addLangs(['en', 'fr', 'de', 'pt']);

    // This language will be used as a fallback when a translation isn't found in the current language
    this._translateService.setDefaultLang('en');
    this._coreTranslationServic.setAllTranslations();
  }
}
