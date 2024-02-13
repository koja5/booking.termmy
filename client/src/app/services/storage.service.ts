import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment.prod';
import { CalendarSettings } from '../models/calendar-settings';

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
    if (
      sessionStorage.getItem(key) &&
      sessionStorage.getItem(key)?.startsWith('{') &&
      sessionStorage.getItem(key)?.endsWith('}')
    ) {
      return JSON.parse(sessionStorage.getItem(key)!);
    } else {
      sessionStorage.getItem(key);
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

  getLocalStorageSimple(key: string) {
    return localStorage.getItem(key);
  }

  getLocalStorageObject(key: string) {
    return JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem(key))));
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

  setCookie(key: string, value: any) {
    this.cookieService.put(key, value, {
      expires: undefined,
      path: '/',
      sameSite: 'lax',
    });
  }

  getCookie(key: string) {
    return this.cookieService.get(key);
  }

  removeCookie(key: string) {
    this.cookieService.remove(key);
  }

  setCookieObject(key: string, value: any) {
    this.cookieService.put(key, JSON.stringify(value), {
      expires: undefined,
      path: '/',
      sameSite: 'lax',
    });
  }

  getCookieObject(key: string) {
    if (this.cookieService.get(key)) {
      return JSON.parse(this.cookieService.get(key)!);
    } else {
      return [];
    }
  }

  getDecodeToken() {
    if (this.getToken()) {
      return this.helper.decodeToken(this.getToken()!).user;
    }
    return false;
  }

  getUserId() {
    if (this.getToken()) {
      return this.helper.decodeToken(this.getToken()!).user.id;
    }
    return false;
  }

  getAdminIdSha1() {
    if (this.getToken()) {
      return this.helper.decodeToken(this.getToken()!).user.admin_id;
    }
    return false;
  }

  // EXTERNAL ACCOUNTS

  setExternalAccountSettings(value: any) {
    // let externalAccountSettings =
    //   localStorage.getItem("external-accounts") || "";
    // let decrypt = CryptoJS.AES.decrypt(
    //   externalAccountSettings,
    //   environment.ENCRIPTY_KEY
    // ).toString(CryptoJS.enc.Utf8);

    // if (decrypt) {
    //   decrypt = JSON.parse(decrypt);
    // }

    // decrypt = value;

    let encrypt = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      environment.ENCRIPTY_KEY
    ).toString();

    localStorage.setItem('external-accounts', encrypt);
  }

  getExternalAccountSettings() {
    const externalAccounts = localStorage.getItem('external-accounts') || '';
    const decrypt = CryptoJS.AES.decrypt(
      externalAccounts,
      environment.ENCRIPTY_KEY
    ).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypt);
  }

  encrypt(value: any) {
    return CryptoJS.AES.encrypt(
      JSON.stringify(value),
      environment.ENCRIPTY_KEY
    ).toString();
  }

  decrypt(value: any) {
    return CryptoJS.AES.decrypt(value, environment.ENCRIPTY_KEY).toString(
      CryptoJS.enc.Utf8
    );
  }

  setCalendarConfig(value: any) {
    let config = this.getLocalStorageObject('config')
      ? this.getLocalStorageObject('config')
      : {};
    config.calendar = value ? value : new CalendarSettings();

    this.setLocalStorage('config', config);
  }

  getCalendarConfig() {
    let config = this.getLocalStorageObject('config')
      ? this.getLocalStorageObject('config')
      : {};
    return Object.values(config.calendar).length != 0
      ? config.calendar
      : new CalendarSettings();
  }

  // END EXTERNAL ACCOUNTS
}
