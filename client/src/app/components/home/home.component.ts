import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public loader = false;

  ngOnInit() {
    setTimeout(() => {
      this.loader = true;
    }, 120);
  }
}
