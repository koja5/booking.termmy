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
  public numberOfWeeks = 4;
  public loader = true;
  public selectedTime: any;
  public worktime: any;
  public id!: string;
  public availableEmployees: any;
  public externalCalendarConnections: any;
  public appointment: any;
  private formatDate = 'DD.MM.YYYY';

  constructor(
    private _activatedRouter: ActivatedRoute,
    private _router: Router,
    private _service: CallApiService,
    private _helpService: HelpService,
    private _storageService: StorageService
  ) {}

  async ngOnInit() {
    if (!this.config) {
      this.config = this._storageService.getCookie('config');
    }
    this.id = this._activatedRouter.snapshot.params.id;
    this.numberOfWeeks = this.config.numberOfWeeks
      ? this.config.numberOfWeeks
      : this.numberOfWeeks;

    this.appointment = await this._service.getSelectedAppointmentValue();
    if (this.appointment && this.appointment.service) {
      this.initialize();
    } else {
      this._service
        .callGetMethod(
          '/api/booking/getService',
          this._activatedRouter.snapshot.queryParams.service
        )
        .subscribe((data: any) => {
          if (data.length) {
            this.appointment.service = data[0];
            this._storageService.setAppointmentToCookie(
              'service',
              this.appointment.service
            );
            this.initialize();
          }
        });
    }
  }

  initialize() {
    // this.getWorkTime();
    this.getAvailableEmployees();
  }

  initializeCalendar() {
    // this.selectedTime =
    //   this._storageService.getAppointmentFromCookie().time ?? null;
    let fromDate = moment();
    let validFromInd = 0;
    if (
      this.worktime &&
      this.worktime.valid_from &&
      moment(this.worktime.valid_from) > fromDate
    ) {
      fromDate = moment(this.worktime.valid_from);
      validFromInd = 1;
    }
    const toDate = validFromInd
      ? moment(this.worktime.valid_from).add(this.numberOfWeeks, 'weeks')
      : moment().add(this.numberOfWeeks, 'weeks');

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
          index: moment(now).format(this.formatDate),
          day: moment(now).date(),
          month: moment(now).month() + 1,
          year: moment(now).year(),
          today: moment(now).format('ll') == moment().format('ll'),
        });
      } else {
        this.allAppointments[moment(now).format(this.formatDate)] = [];
      }
      now.add(1, 'days');
      i++;
    }
  }

  getWorkTime(data: any) {
    this.loader = true;
    for (let i = 0; i < data.length; i++) {
      this._service
        .callGetMethod('/api/booking/getWorkTime', data[i].id)
        .subscribe((data: any) => {
          this.worktime = data;
          if (data) {
            this.initializeCalendar();
            this.packWorkTimePerDays(this.worktime);
            this.removeOldTimeForToday();
          }
        });
    }
  }

  packWorkTimePerDays(data: any) {
    let calendarDate = moment();
    const allWorkTimes = JSON.parse(data.value);
    for (let week = 0; week < this.numberOfWeeks; week++) {
      for (let i = 0; i < allWorkTimes.length; i++) {
        for (let j = 0; j < 7; j++) {
          let dayInWeek = calendarDate.day();
          let date = calendarDate.format(this.formatDate);
          const worktime = this.getWorkTimeForDay(allWorkTimes, dayInWeek);
          if (worktime.active) {
            if (!this.allAppointments[date]) {
              this.allAppointments[date] = [];
            }
            for (let k = 0; k < worktime.times.length; k++) {
              if (worktime.times[k].start && worktime.times[k].end) {
                let start = moment(worktime.times[k].start);
                let end = moment(worktime.times[k].end);
                while (start < end) {
                  this.allAppointments[date].push(
                    this.appointmentModel(
                      data,
                      moment(calendarDate).set({
                        hour: start.hour(),
                        minute: start.minutes(),
                        second: start.seconds(),
                        millisecond: start.millisecond(),
                      })
                    )
                  );
                  start = moment(start).add(
                    this.appointment.service.time_blocked,
                    'minute'
                  );
                  if (start > end) {
                    this.allAppointments[date].splice(-1);
                    break;
                  }
                }
              }
            }
          } else {
            if (!this.allAppointments[date]) {
              this.allAppointments[date] = [];
            }
          }
          this.allAppointments[date] = this.allAppointments[date].sort(
            (a: any, b: any) => a.time - b.time
          );
          calendarDate = moment(calendarDate).add(1, 'day');
        }
      }
    }
  }

  removeOldTimeForToday() {
    const today = moment().format(this.formatDate);
    for (let i = 0; i < this.allAppointments[today].length; i++) {
      if (this.allAppointments[today][i].time <= moment()) {
        this.allAppointments[today].splice(i, 1);
        i--;
      }
    }
  }

  removeNoTime() {
    for (let i = 0; i < this.days.length; i++) {
      if (!this.allAppointments[this.days[i].index].length) {
        this.days.splice(i, 1);
        // this.allAppointments.splice(this.days[i].index, 1);
        i--;
      }
    }
  }

  checkMaximumAvailableAppointments() {
    if (this.config.display_max_available_appointments) {
      let sum = 0;
      let i = 0;
      for (i = 0; i < this.days.length; i++) {
        if (sum <= this.config.display_max_available_appointments) {
          sum += this.allAppointments[this.days[i].index].length;
          if (sum === this.config.display_max_available_appointments) {
            break;
          } else if (sum > this.config.display_max_available_appointments) {
            const differenceIndex =
              this.config.display_max_available_appointments - sum;
            this.allAppointments[this.days[i].index].splice(differenceIndex);
            break;
          }
        }
      }
      if (i < this.days.length) {
        this.days.splice(i + 1, this.days.length);
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
        this.getWorkTime(data);
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
      .callPostMethod('/api/booking/getAllScheduledTermines', data)
      .subscribe((data) => {
        // this.scheduledTermines = this.scheduledTermines.concat(data);
        this.removeScheduledTermineFromAvailableSlot(data);
      });
  }

  getScheduledTerminesFromExternalCalendar(data: any) {
    if (data.length) {
      this._service
        .callPostMethod('/api/google/getAllScheduledTermines', data)
        .subscribe((data: any) => {
          data = this.removeAllDayScheduledTermineFromAvailableSlot(data);
          this.removeScheduledTermineFromAvailableSlot(data);
        });
    }
  }

  removeAllDayScheduledTermineFromAvailableSlot(data: any) {
    data = data.sort((a: any, b: any) => {
      return b.allDay - a.allDay;
    });
    for (let i = 0; i < data.length; i++) {
      if (data[i].allDay) {
        let start = data[i].start;
        let end = data[i].end;
        while (moment(start) < moment(end)) {
          const date = moment(start).format(this.formatDate);
          this.allAppointments[date] = [];
          start = moment(start).add('day', 1);
        }
        data.splice(i, 1);
        i--;
      }
    }
    return data;
  }

  removeScheduledTermineFromAvailableSlot(data: any) {
    const formatDate = this.formatDate;

    data.forEach((scheduledItem: any) => {
      const scheduledStart = moment(
        scheduledItem.start ?? scheduledItem.StartTime
      );
      const scheduledEnd = moment(scheduledItem.end ?? scheduledItem.EndTime);
      const dateKey = scheduledStart.format(formatDate);
      const employeeId = scheduledItem.employee_id;

      if (!this.allAppointments[dateKey]) return;

      this.allAppointments[dateKey] = this.allAppointments[dateKey].filter(
        (slot: any) => {
          const slotStart = moment(slot.time);
          const slotEnd = slotStart.clone().add(this.appointment.service.time_blocked, 'minutes'); // Pretpostavimo 15min slot

          const overlaps =
            slotStart.isBefore(scheduledEnd) && slotEnd.isAfter(scheduledStart);

          const sameEmployee = !employeeId || slot.employee_id === employeeId;

          // Ako se preklapa i za istog zaposlenog – uklanjamo
          return !(overlaps && sameEmployee);
        }
      );
    });

    this.getHolidays();
  }

  getHolidays() {
    this._service
      .callGetMethod('/api/booking/getMyHolidays', this.id)
      .subscribe((data: any) => {
        this.loader = false;
        if (data.length) {
          const holidays = this._helpService.getHolidaysForSelectedCountry(
            data[0].code
          );
          this.deleteAvailableAppointmentsDueToHolidays(holidays);
        }
        this.checkBookingConfigurationForAppointmens();
      });
  }

  checkBookingConfigurationForAppointmens() {
    if (!this.config.display_day_without_free_appointments) {
      this.removeNoTime();
    }
    this.checkMaximumAvailableAppointments();
  }

  deleteAvailableAppointmentsDueToHolidays(holidays: any) {
    for (let i = 0; i < holidays.length; i++) {
      const date = moment(holidays[i].start).format(this.formatDate);
      if (this.allAppointments[date]) {
        this.allAppointments[date] = [];
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
    this._storageService.setAppointmentToCookie(
      'time',
      moment(time).toISOString()
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
    if (moment(this.selectedTime).toISOString() === time.toISOString()) {
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
            userWithoutExternalCalendar.push(allAvailableEmployees[j]);
            allAvailableEmployees.splice(j, 1);
            j--;
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
