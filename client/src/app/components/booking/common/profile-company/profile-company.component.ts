import { Component, ElementRef, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-profile-company',
  templateUrl: './profile-company.component.html',
  styleUrls: ['./profile-company.component.scss'],
})
export class ProfileCompanyComponent {
  @Input() config: any;
  public dashboardLink = environment.DASHBOARD_LINK;

  generateWebsiteLink(website: string) {
    window.open('https://' + website);
  }
}
