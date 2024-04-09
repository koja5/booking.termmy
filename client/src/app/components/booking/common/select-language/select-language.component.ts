import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-select-language',
  templateUrl: './select-language.component.html',
  styleUrls: ['./select-language.component.scss'],
})
export class SelectLanguageComponent {
  public showLanguage = '';
  public selectedLanguage = 'en';

  constructor(private _translate: TranslateService) {}

  ngOnInit() {
    this.setLanguage();
  }

  setLanguage() {
    const language = this.getLang();
    this.selectedLanguage = language;
    if (['en', 'de', 'rs'].indexOf(language) > -1) {
      this._translate.setDefaultLang(language);
    } else {
      this._translate.setDefaultLang('en');
    }
  }

  switchLanguage(lang: string) {
    this._translate.setDefaultLang(lang);
    this._translate.use(lang);
    localStorage.setItem('language', lang);
    this.selectedLanguage = lang;
    this.showLanguage = '';
  }

  public getLang(): string {
    let lang: string;
    if (localStorage.getItem('language')) {
      lang = localStorage.getItem('language') || 'en';
    } else {
      lang = (window?.navigator.language || '').substring(0, 2);
    }
    return lang;
  }
}
