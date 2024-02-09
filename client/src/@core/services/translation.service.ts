import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

// import { locale as english } from "../../i18n/en";
// import { locale as french } from "./../../i18n/fr";
// import { locale as german } from "../../i18n/de";
// import { locale as portuguese } from "../../i18n/pt";

import en from '../../assets/configurations/i18n/en.json';
import de from '../../assets/configurations/i18n/de.json';
import fr from '../../assets/configurations/i18n/fr.json';
import pt from '../../assets/configurations/i18n/pt.json';
import rs from '../../assets/configurations/i18n/rs.json';

export interface Locale {
  lang: string;
  data: Object;
}

@Injectable({
  providedIn: 'root',
})
export class CoreTranslationService {
  /**
   * Constructor
   *
   * @param {TranslateService} _translateService
   */
  constructor(private _translateService: TranslateService) {}

  // Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Translate
   *
   * @param {Locale} args
   */

  setAllTranslations() {
    this.translate(en, de, fr, pt, rs);
  }

  translate(...args: Locale[]): void {
    const locales = [...args];

    locales.forEach((locale) => {
      // use setTranslation() with the third argument value as true to append translations instead of replacing them
      this._translateService.setTranslation(locale.lang, locale.data, true);
    });
  }
}
