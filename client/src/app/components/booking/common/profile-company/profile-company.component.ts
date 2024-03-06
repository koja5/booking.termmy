import { Component, ElementRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CallApiService } from 'src/app/services/call-api.service';

@Component({
  selector: 'app-profile-company',
  templateUrl: './profile-company.component.html',
  styleUrls: ['./profile-company.component.scss'],
})
export class ProfileCompanyComponent {
  @Input() config: any;

  generateWebsiteLink(website: string) {
    window.open('https://' + website);
  }
}
