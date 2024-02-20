import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CallApiService } from 'src/app/services/call-api.service';
import { HelpService } from 'src/app/services/help.service';
import { StorageService } from 'src/app/services/storage.service';

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
  public scheduledTermines = [];
  public numberOfWeeks = 2;
  public loader = true;
  public selectedTime: any;
  public worktime: any;
  public id!: string;
  public availableEmployees: any;
  public externalCalendarConnections: any;
  public appointment: any;

  constructor(
    private _activatedRouter: ActivatedRoute,
    private _router: Router,
    private _service: CallApiService,
    private _helpService: HelpService,
    private _storageService: StorageService
  ) {}

  ngOnInit() {
    this.id = this._activatedRouter.snapshot.params.id;
    this.numberOfWeeks = this.config.numberOfWeeks
      ? this.config.numberOfWeeks
      : this.numberOfWeeks;
    this.appointment = this._service.getSelectedAppointmentValue();
    this.getWorkTime();
    this.initializeCalendar();
    this.getAvailableEmployees();
  }

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
          let date = calendarDate.format('DD.MM.YYYY');
          const worktime = this.getWorkTimeForDay(allWorkTimes, dayInWeek);
          if (worktime.active) {
            if (!this.allAppointments[date]) {
              this.allAppointments[date] = [];
            }
            for (let k = 0; k < worktime.times.length; k++) {
              if (worktime.times[k].start && worktime.times[k].end) {
                let start = moment(worktime.times[k].start).utc();
                let end = moment(worktime.times[k].end).utc();
                while (start < end) {
                  this.allAppointments[date].push(
                    this.appointmentModel(
                      data,
                      moment(calendarDate).utc().set({
                        hour: start.hour(),
                        minute: start.minutes(),
                        second: start.seconds(),
                        millisecond: start.millisecond(),
                      })
                    )
                  );
                  start = moment(start).add(
                    this.appointment.service.time_duration,
                    'minute'
                  );
                }
              }
            }
          } else {
            if (!this.allAppointments[date]) {
              this.allAppointments[date] = [];
            }
          }
          calendarDate = moment(calendarDate).add(1, 'day');
        }
      }
    }
  }

  getAvailableEmployees() {
    // check if multilocations
    const queryParams = this._activatedRouter.snapshot.queryParams;
    let location = null;
    if (queryParams.location) {
      location = queryParams.location;
    }

    this._service
      .callPostMethod('/api/booking/getAvailableEmployees', {
        booking_link: this.id,
        location_id: location,
      })
      .subscribe((data) => {
        this.availableEmployees = data;
        this.getScheduledTermines(data);
      });
  }

  getScheduledTermines(data: any) {
    //check first if employees have connection to some external calendars
    let result = data.map((a: any) => a.id);
    this._service
      .callPostMethod('/api/booking/getExternalCalendarConnections', result)
      .subscribe((data) => {
        //employees who have connection to external calendar
        this.externalCalendarConnections = data;
        this.getScheduledTerminesFromExternalCalendar(data);

        //employees without connection to external calendar
        const employeesWithoutExternalCalendar =
          this.getEmployeesWithoutExternalCalendar(data);
        if (employeesWithoutExternalCalendar.length) {
          this.getScheduledTerminesFromDatabase(
            employeesWithoutExternalCalendar
          );
        }
      });
  }

  getScheduledTerminesFromDatabase(data: any) {
    this._service
      .callPostMethod('api/booking/getAllScheduledTermines', data)
      .subscribe((data) => {
        console.log(data);
        // this.scheduledTermines = this.scheduledTermines.concat(data);
        this.removeScheduledTermineFromAvailableSlot(data);
        this.loader = false;
      });
  }

  getScheduledTerminesFromExternalCalendar(data: any) {
    if (data.length) {
      this._service
        .callPostMethod('/api/google/getAllScheduledTermines', data)
        .subscribe((data: any) => {
          console.log(data);
          this.removeScheduledTermineFromAvailableSlot(data);
          this.loader = false;
        });
    }
  }

  removeScheduledTermineFromAvailableSlot(data: any) {
    for (let i = 0; i < data.length; i++) {
      const date = moment(data[i].start ?? data[i].StartTime).format(
        'DD.MM.YYYY'
      );
      for (let j = 0; j < this.allAppointments[date].length; j++) {
        if (
          this.allAppointments[date][j].time.utcOffset(0, true) >=
            moment(data[i].start ?? data[i].StartTime).utc() &&
          this.allAppointments[date][j].time.utcOffset(0, true) <
            moment(data[i].end ?? data[i].EndTime).utc()
        ) {
          this.allAppointments[date].splice(j, 1);
          j--;
        }
      }
    }
  }

  //#region HELPFUL FUNCTION

  appointmentModel(worktime: any, time: any) {
    return {
      employee_id: worktime.user_id,
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

  selectTime(time: any, employee_id: number) {
    this.selectedTime = time;
    this._storageService.setAppointmentToCookie(
      'employee',
      this.checkIfEmployeeHaveExternalConnections(employee_id)
    );
    this._router.navigate(['.'], {
      relativeTo: this._activatedRouter.parent,
      queryParams: {
        appointment: moment(time).toISOString(),
        employee: employee_id,
      },
      queryParamsHandling: 'merge',
    });
  }

  getInfoForEmployee(employee_id: number) {
    const externalCalendarConnections =
      this.checkIfEmployeeHaveExternalConnections(employee_id);

    return this._storageService.encrypt({
      employee_id: employee_id,
      externalCalendarConnections: externalCalendarConnections,
    });
  }

  checkIfEmployeeHaveExternalConnections(employee_id: number) {
    const connections = this.externalCalendarConnections.filter(
      (e: any) => e.user_id === employee_id
    );
    if (connections.length) {
      return connections[0];
    } else {
      return connections;
    }
  }

  isSelected(time: any) {
    if (this.selectedTime.toDate() === time.toDate()) {
      return true;
    }
    return false;
  }

  getEmployeesWithoutExternalCalendar(employeesWithExternalCalendar: any) {
    let userWithoutExternalCalendar = [];
    let allAvailableEmployees = this._helpService.copyObject(
      this.availableEmployees
    );
    if (employeesWithExternalCalendar.length) {
      for (let i = 0; i < employeesWithExternalCalendar.length; i++) {
        for (let j = 0; j < allAvailableEmployees.length; j++) {
          if (
            allAvailableEmployees[j].id !=
            employeesWithExternalCalendar[i].user_id
          ) {
            userWithoutExternalCalendar.push(allAvailableEmployees[j].id);
            allAvailableEmployees.splice(j, 1);
          }
        }
      }
    } else {
      userWithoutExternalCalendar = allAvailableEmployees;
    }
    return userWithoutExternalCalendar;
  }

  //#endregion
}
