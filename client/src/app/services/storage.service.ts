import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment.prod';
import { CalendarSettings } from '../models/calendar-settings';
import { CallApiService } from './call-api.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  helper = new JwtHelperService();

  constructor(private cookieService: CookieService) {}

  setSessionStorage(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  getSessionStorage(key: string) {
    const storage = sessionStorage.getItem(key);
    if (storage?.startsWith('{') && storage?.endsWith('}')) {
      return JSON.parse(storage);
    } else {
      return storage;
    }
  }

  removeAllSessionStorage() {
    sessionStorage.clear();
  }

  removeSessionStorage(key: string) {
    sessionStorage.removeItem(key);
  }

  setLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  getLocalStorage(key: string) {
    const storage = localStorage.getItem(key);
    if (storage?.startsWith('{') && storage?.endsWith('}')) {
      return JSON.parse(storage);
    } else {
      return storage;
    }
  }

  removeAllLocalStorage() {
    localStorage.clear();
  }

  removeLocalStorage(key: string) {
    localStorage.removeItem(key);
  }

  path?: string;
  domain?: string;
  expires?: string | Date;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  storeUnencoded?: boolean;

  setToken(token: any) {
    this.cookieService.put('token', token, {
      expires: new Date(new Date().getTime() + 86400000),
      sameSite: 'lax',
    });
  }

  getToken() {
    return this.cookieService.get('token');
  }

  deleteToken() {
    this.cookieService.remove('token');
  }

  removeCookie(key: string) {
    this.cookieService.remove(key);
  }

  setCookie(key: string, value: any) {
    this.cookieService.put(key, JSON.stringify(value), {
      expires: undefined,
      path: '/',
      sameSite: 'lax',
    });
  }

  getCookie(key: string) {
    const cookie = this.cookieService.get(key);
    if (cookie?.startsWith('{') && cookie.endsWith('}')) {
      return JSON.parse(cookie);
    } else {
      return cookie;
    }
  }

  getDecodeToken() {
    if (this.getToken()) {
      return this.helper.decodeToken(this.getToken()!).user;
    }
    return false;
  }

  encrypt(value: any) {
    return CryptoJS.AES.encrypt(
      JSON.stringify(value),
      environment.ENCRIPTY_KEY
    ).toString();
  }

  decrypt(value: any) {
    const decrypt = CryptoJS.AES.decrypt(
      value,
      environment.ENCRIPTY_KEY
    ).toString(CryptoJS.enc.Utf8);
    if (decrypt && decrypt.startsWith('{') && decrypt.endsWith('}')) {
      return JSON.parse(decrypt);
    } else {
      return decrypt;
    }
  }

  setAppointmentToCookie(property: string, object: any) {
    const value = this.getCookie('appointment') ?? {};
    value[property] = object;
    this.setCookie('appointment', value);
  }

  getAppointmentFromCookie() {
    return this.getCookie('appointment');
  }
}
