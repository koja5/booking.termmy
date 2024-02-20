import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelpService } from './help.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment.prod';
import { StorageService } from './storage.service';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CallApiService {
  private headers: HttpHeaders;
  constructor(
    private http: HttpClient,
    private helpService: HelpService,
    private _storageService: StorageService,
    private _activatedRouter: ActivatedRoute
  ) {
    this.headers = new HttpHeaders();
  }

  callApi(data: any, router?: any) {
    if (data && data.request.type === 'POST') {
      if (data.request.url) {
        data.body = this.helpService.postRequestDataParameters(
          data.body,
          router.snapshot.params,
          data.request.url
        );
      }
      return this.callPostMethod(
        data.request.api,
        data.body ? data.body : router.body
      );
    } else {
      if (data && data.request.url) {
        const dataValue = this.helpService.getRequestDataParameters(
          router.snapshot.params,
          data.request.url
        );
        return this.callGetMethod(data.request.api, dataValue);
      } else {
        let dataValue = '';
        if (router && router.snapshot && data && data.request) {
          dataValue = this.helpService.getRequestDataParameters(
            router.snapshot.params,
            data.request.parameters
          );
          return this.callGetMethod(data.request.api, dataValue);
        } else {
          return this.callGetMethod(router.api, dataValue);
        }
      }
    }
  }

  callServerMethod(request: any, data: any, router?: any) {
    if (request.url) {
      data = this.helpService.postRequestDataParameters(
        data,
        router.snapshot.params,
        request.url
      );
    }
    if (request.type === 'POST') {
      return this.callPostMethod(request.api, data);
    } else {
      return this.callGetMethod(request.api, data);
    }
  }

  callPostMethod(api: string, data: any) {
    return this.http.post(api, data, { headers: this.headers });
  }

  callGetMethod(api: string, data: any) {
    if (data === undefined) {
      data = '';
    }
    const url = api.endsWith('/') ? api + data : api + '/' + data;
    return this.http.get(url, { headers: this.headers });
  }

  getDocument(body: any) {
    return this.http.post('/api/upload/getDocument', body, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json'),
    });
  }

  packParametarPost(data: any, fields: any) {
    let model = [];
    if (fields) {
      for (let i = 0; i < fields.length; i++) {
        model[fields[i].name] = data[fields[i].path];
      }
      return model;
    } else {
      return {};
    }
  }

  packParametarGet(data: any, fields: any) {
    let model = [];
    if (fields) {
      for (let i = 0; i < fields.length; i++) {
        model.push(data[fields[i]]);
      }
    }

    return model.toString();
  }

  checkout(products: any) {
    this.callPostMethod('/api/checkout', { items: products }).subscribe(
      async (res: any) => {
        let stripe = await loadStripe(environment.STRIPE_KEY);
        stripe?.redirectToCheckout({
          sessionId: res.id,
        });
      }
    );
  }

  getSelectedAppointmentValue() {
    const appointment = this._storageService.getAppointmentFromCookie() ?? {};
    if (!appointment || !appointment.service) {
      this.callGetMethod(
        '/api/booking/getService',
        this._activatedRouter.snapshot.queryParams.service
      ).subscribe((data: any) => {
        if (data.length) {
          appointment.service = data[0];
          this._storageService.setAppointmentToCookie(
            'service',
            appointment.service
          );
        }
      });
    }

    if (!appointment || !appointment.employee) {
      this.callGetMethod(
        '/api/booking/getEmployee',
        this._activatedRouter.snapshot.queryParams.employee
      ).subscribe((data: any) => {
        if (data.length) {
          appointment.employee = data[0];
          this._storageService.setAppointmentToCookie(
            'employee',
            appointment.employee
          );
        }
      });
    }
    return appointment;
  }
}
