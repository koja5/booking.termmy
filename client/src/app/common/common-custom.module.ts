import { NgModule } from '@angular/core';
import { ToastrComponent } from './toastr/toastr.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [ToastrComponent],
  imports: [],
  providers: [ToastrComponent, ToastrService],
  bootstrap: [],
})
export class CommonCustomModule {}
