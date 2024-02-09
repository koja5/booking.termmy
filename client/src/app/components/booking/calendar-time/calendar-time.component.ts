import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-time',
  templateUrl: './calendar-time.component.html',
  styleUrls: ['./calendar-time.component.scss'],
})
export class CalendarTimeComponent {
  @Input() config: any;

  public week: any;
  public month: any;
  public days: any = [];
  public allAppointments: any = {};

  constructor(private _activatedRouter: ActivatedRoute) {}

  ngOnInit() {
    this.initializeCalendar();
  }

  initializeCalendar() {
    this.week = moment().startOf('isoWeek');
    this.month = this.week.format('MMMM YYYY');

    this.days = [];
    for (let i = 0; i <= 15; i++) {
      this.days.push({
        name: this.week.isoWeekday(i + 1).format('ddd'),
        day: moment(this.week).date(),
        month: moment(this.week).month(),
        year: moment(this.week).year(),
        today: moment(this.week).format('ll') == moment().format('ll'),
      });
    }
  }

  checkTime(indexDay: number, indexTime: number) {}

  selectTime(
    date: any,
    time: any,
    user_id: number,
    indexDay: number,
    indexTime: number
  ) {}
}
