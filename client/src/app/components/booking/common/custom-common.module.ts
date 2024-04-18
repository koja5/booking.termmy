import { NgModule } from '@angular/core';
import { SelectLanguageComponent } from './select-language/select-language.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

const routes = [];

@NgModule({
  declarations: [SelectLanguageComponent],
  imports: [CommonModule, TranslateModule],
  providers: [],
  bootstrap: [],
  exports: [SelectLanguageComponent],
})
export class CustomCommonModule {}
