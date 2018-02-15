
import { Authentication } from './authentication.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Account } from './model/account';
import { JWTToken } from './jwt-token';

import { environment } from '../environments/environment';
import 'rxjs/add/operator/concatMap';

interface APIResponse
{
  status?: number;
  message?: string;
  offset?: number;
  count?: number;
  total?: number;
  data?: any;
}

@Injectable()
export class API
{
  private accessToken = '';
  private idToken = '';

  constructor( private authentication:Authentication,private http:HttpClient ) {
    this.authentication.accessToken.subscribe(next => { this.accessToken = next; } );
    this.authentication.idToken.subscribe(next => { this.idToken = next; } );
  }

  getAccount() : Observable<Account> {
    const payload = new JWTToken( this.idToken ).decodePayload();
    const sub = payload.sub || '';

    const observable = this.http
      .get<APIResponse>(environment.arreev_api_host + '/account?sub=' + sub )
      .concatMap( r => {
        return Observable.of( r.data );
      } );

    return observable;
  }

  putAccount( account: Account ) : Observable<Account> {
    const payload = new JWTToken( this.idToken ).decodePayload();
    const sub = payload.sub || '';

    const body = JSON.stringify( account );

    const observable = this.http
      .put<APIResponse>(environment.arreev_api_host + '/account?sub=' + sub,body )
      .concatMap( r => {
        return Observable.of( r.data );
      } );

    return observable;
  }
}
