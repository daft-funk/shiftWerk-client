import { Injectable } from '@angular/core';
import { GoogleAuthService } from 'ng-gapi';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin, from } from 'rxjs';
import { catchError, map, concatMap } from 'rxjs/operators';
import { Werker, Maker } from './types';

const httpOptions = {
  headers: new HttpHeaders({ 'content-type': 'application/json' }),
};
const serverUrl = 'http://35.185.77.220:4000';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private googleAuth: GoogleAuthService,
    private storage: Storage,
    private http: HttpClient
  ) {}
  public static STORAGE_KEY = 'accessToken';
  public static STORAGE_ID = 'idToken';
  public static USER = 'user';
  public user: Werker | Maker;
  _webClientId: String = '347712232584-9dv95ud3ilg9bk7vg8i0biqav62fh1q7.apps.googleusercontent.com';

  /**
   * handles pipeline of login functions
   * executes each function in sequence
   *
   * @param role - either 'werker' or 'maker'
   */
  public login(role: string): Observable<any> {
    return this.signIn(role)
      .pipe(
        // res.signIn is method from GoogleAuthService
        concatMap(res => res.signIn()),
        concatMap(res => this.signInSuccess(res, role)),
        concatMap(() => this.getToken()),
        concatMap(token => this.saveLogin(token, role))
      );
  }

  /**
   * uses GoogleAuthService to request permissions from user
   *
   * @param role - either 'werker' or 'maker'
   */
  private signIn(role: string): Observable<any> {
    return this.googleAuth.getAuth()
      .pipe(
        catchError(err => throwError(err)));
  }

  /**
   * stores relevant info in local storage
   *
   * @param res - google auth response
   * @param role - either 'werker' or 'maker'
   */
  private signInSuccess(res, role: string): Observable<any> {
    alert(JSON.stringify(res));
    const token = res.getAuthResponse();
    if (role === 'maker') {
      this.user = {
        type: 'Maker',
        name: res.w3.ig,
        email: res.w3.U3,
        url_photo: res.w3.Paa,
      };
    } else {
      this.user = {
        type: 'Werker',
        name_first: res.w3.ofa,
        name_last: res.w3.wea,
        email: res.w3.U3,
        url_photo: res.w3.Paa,
        bio: '',
        certifications: [],
        positions: [],
        shifts: []
      };
    }
    alert(JSON.stringify(this.user));
    return from(Promise.all([
      this.storage.set(
        AuthService.STORAGE_KEY, token.access_token
      ),
      this.storage.set(
        AuthService.STORAGE_ID, token.id_token
      ),
      this.storage.set(
        AuthService.USER, this.user
      )
    ])
    ).pipe(catchError(err => throwError(err)));
  }

  /**
   * sends access token to API server for verification and storage
   *
   * @param token - access_token from google
   * @param role - either 'werker' or 'maker'
   */
  private saveLogin(token: string, role: string): Observable<any> {
    console.log(token);
    const endpoint = role === 'werker' ? 'werkers' : 'makers';
    return this.http.put(`${serverUrl}/${endpoint}`, token, httpOptions)
      .pipe(catchError(err => throwError(err)));
  }

  /**
   * gets user from local storage
   */
  private getLocalUserInfo(): Observable<Werker | Maker> {
    return from(this.storage.get('USER'))
      .pipe(catchError(err => throwError(err)));
  }

  /**
   * gets access token from local storage
   */
  private getToken(): Observable<string> {
    return from(this.storage.get(AuthService.STORAGE_KEY));
  }

  /**
   * submits access token to API server for verification
   * res should have either user info or notification
   * that user is not verified
   *
   * @todo make this work
   *
   * @param token - access token from google
   * @param role - either 'werker' or 'maker'
   */
  private verifyUser(token: string, role: string): Observable<any> {
    return this.http.put('/login', token, httpOptions);
  }

  /**
   * updates local storage with new data
   *
   * @param values - object with new values for local user
   */
  private updateLocalUserInfo(values: Object): Observable<any> {
    return from(this.storage.set(
      AuthService.USER, Object.assign(this.user, values)
      ));
  }

  /**
   * updates API server with new data on user
   *
   * @param values - object with new values for server
   */
  private updateServerUserInfo(user: Werker | Maker, values: Object): Observable<any> {
    return this.http.patch(`${serverUrl}/settings`, Object.assign(user, values), httpOptions)
      .pipe(catchError(err => throwError(err)));
  }

  /**
   * gets a default user for demonstration purposes
   *
   * @param role - either 'werker' or 'maker'
   */
  public getDefaultUser(role: string): Observable<any> {
    return this.http.get(`${serverUrl}/${role}/5`)
      .pipe(catchError(err => throwError(err)));
  }
}
