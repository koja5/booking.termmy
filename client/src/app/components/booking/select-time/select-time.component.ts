import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CallApiService } from 'src/app/services/call-api.service';

@Component({
  selector: 'app-select-time',
  templateUrl: './select-time.component.html',
  styleUrls: ['./select-time.component.scss'],
})
export class SelectTimeComponent {
  @Input() config: any;

  public week: any;
  public month: any;
  public days: any = [];
  public allAppointments: any = {};
  public numberOfWeeks = 2;
  public loader = true;
  public selectedTime: any;
  public worktime: any;

  constructor(
    private _activatedRouter: ActivatedRoute,
    private _router: Router,
    private _service: CallApiService
  ) {}

  ngOnInit() {
    this.numberOfWeeks = this.config.numberOfWeeks
      ? this.config.numberOfWeeks
      : this.numberOfWeeks;
    this.getWorkTime();
    this.initializeCalendar();
  }

  // initializeCalendar() {
  //   this.week = moment().startOf('isoWeek');
  //   this.month = this.week.format('MMMM YYYY');

  //   this.days = [];
  //   for (let i = 0; i <= 15; i++) {
  //     this.days.push({
  //       date: moment().toString(),
  //       name: this.week.isoWeekday(i + 1).format('ddd'),
  //       day: moment(this.week).date(),
  //       month: moment(this.week).month(),
  //       year: moment(this.week).year(),
  //       today: moment(this.week).format('ll') == moment().format('ll'),
  //     });
  //   }
  // }

  initializeCalendar() {
    this.selectedTime = moment(
      this._activatedRouter.snapshot.queryParams.appointment
    );
    const fromDate = moment();
    const toDate = moment().add(this.numberOfWeeks, 'weeks');

    var now = fromDate;
    this.days = [];

    let i = 0;
    let week = 0;

    while (now.isSameOrBefore(toDate)) {
      if (i === 7) {
        week++;
        i = 0;
      }
      if (now.day() != 0 && now.day() != 6) {
        this.days.push({
          name: now.locale('de').format('dd'),
          date: moment(now).toString(),
          index: moment(now).format('DD.MM.YYYY'),
          day: moment(now).date(),
          month: moment(now).month() + 1,
          year: moment(now).year(),
          today: moment(now).format('ll') == moment().format('ll'),
        });
      } else {
        this.allAppointments[moment(now).format('DD.MM.YYYY')] = [];
      }
      now.add(1, 'days');
      i++;
    }
  }

  getWorkTime() {
    this.loader = true;
    this._service
      .callGetMethod(
        '/api/booking/getWorkTime',
        this._activatedRouter.snapshot.params.id
      )
      .subscribe((data: any) => {
        this.worktime = data;
        if (data && data.length) {
          this.packWorkTimePerDays(data[0]);
          this.loader = false;
        }
      });
  }

  packWorkTimePerDays(data: any) {
    let calendarDate = moment();
    const allWorkTimes = JSON.parse(data.value);
    for (let week = 0; week < this.numberOfWeeks; week++) {
      for (let i = 0; i < allWorkTimes.length; i++) {
        for (let j = 0; j < 7; j++) {
          let dayInWeek = calendarDate.day();
          let date = calendarDate.toString();
          const worktime = this.getWorkTimeForDay(allWorkTimes, dayInWeek);
          if (worktime.active) {
            if (!this.allAppointments[date]) {
              this.allAppointments[date] = [];
            }
            for (let k = 0; k < worktime.times.length; k++) {
              if (worktime.times[k].start && worktime.times[k].end) {
                let start = moment(worktime.times[k].start);
                let end = moment(worktime.times[k].end);
                const differentBetweenTwoTimes = moment.duration(
                  moment(end).diff(moment(start))
                );
                while (start < end) {
                  this.allAppointments[date].push(
                    this.appointmentModel(
                      data,
                      moment(calendarDate).set({
                        hour: start.hour(),
                        minute: start.minutes(),
                        second: start.seconds(),
                      })
                    )
                  );
                  start = moment(start).add(30, 'minute');
                }
                // if (differentBetweenTwoTimes.asMinutes()) {
                //   const iteration = Math.floor(
                //     differentBetweenTwoTimes.asMinutes() /
                //       Number(data[i].time_therapy)
                //   );
                //   let startTimeAppointment = start;

                //   for (let l = 0; l < Number(iteration); l++) {
                //     const newAppointmentTime = moment(startTimeAppointment).add(
                //       Number(data[i].time_therapy) * l,
                //       'minutes'
                //     );
                //     if (
                //       newAppointmentTime.hours() > moment().hours() ||
                //       (newAppointmentTime.hours() == moment().hours() &&
                //         newAppointmentTime.minutes() > moment().minutes()) ||
                //       worktime[dayInWeek].id != moment().day() - 1 ||
                //       week > 0
                //     ) {
                //       this.allAppointments[date].push(
                //         this.generateAppointment(newAppointmentTime, data[i])
                //       );
                //     } else {
                //       this.allAppointments[date].push(
                //         this.generateAppointment(null, data[i])
                //       );
                //     }
                //   }
                // }
              }
            }
          } else {
            if (!this.allAppointments[date]) {
              this.allAppointments[date] = [];
            }
            // this.allAppointments[date].push(
            //   this.generateAppointment(null, data[i])
            // );
          }

          calendarDate = moment(calendarDate).add(1, 'day');
          // dayInWeek = calendarDate.day() != 0 ? dateInWeek.day() - 1 : 0;
          // date = dateInWeek.format('DD.MM.YYYY');
        }
      }
      // dateInCalendar = moment(dateInCalendar).add(1, 'week');
    }
    console.log(this.allAppointments);
  }

  appointmentModel(worktime: any, time: any) {
    return {
      user_id: worktime.user_id,
      time: time,
    };
  }

  getWorkTimeForDay(worktime: any, day: number) {
    for (let i = 0; i < worktime.length; i++) {
      if (worktime[i].id == day) {
        return worktime[i];
      }
    }
    return null;
  }

  checkTime(indexDay: number, indexTime: number) {}

  selectTime(
    date: any,
    time: any,
    user_id: number,
    indexDay: number,
    indexTime: number
  ) {
    this.selectedTime = time;
    this._router.navigate(['.'], {
      relativeTo: this._activatedRouter.parent,
      queryParams: { step: 2, appointment: time, user: user_id },
      queryParamsHandling: 'merge',
    });
  }

  isSelected(time: any) {
    console.log(this.selectedTime.toDate(), time.toDate());
    if (this.selectedTime.toDate() === time.toDate()) {
      return true;
    }
    return false;
  }
}
