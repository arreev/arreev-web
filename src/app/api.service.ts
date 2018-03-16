
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Authentication } from './authentication.service';
import { Transporter } from './model/transporter';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Account } from './model/account';
import { Follow } from './model/follow';
import { JWTToken } from './jwt-token';
import { Fleet } from './model/fleet';

import { environment } from '../environments/environment';

import 'rxjs/add/observable/from';
import 'rxjs/add/operator/concatMap';

class APIResponse
{
  status?: number;
  message?: string;
  offset?: number;
  count?: number;
  total?: number;
}

class AccountResponse extends APIResponse { account?: Account = null; }
class FleetsResponse extends APIResponse { fleets?: Fleet[] = null; }
class FleetResponse extends APIResponse { fleet?: Fleet = null; }
class TransportersResponse extends APIResponse { transporters?: Transporter[] = null; }
class TransporterResponse extends APIResponse { transporter?: Transporter = null; }
class FollowResponse extends APIResponse { follow?: Follow = null; }
class FollowsResponse extends APIResponse { follows?: Follow[] = null; }

class StorageMetadata
{
  name?: string;
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

  /**
   *
   * @returns {Observable<Account>}
   */
  getAccount() : Observable<Account> {
    const payload = new JWTToken( this.idToken ).decodePayload();
    const sub = payload.sub || '';

    const observable = this.http
      .get<AccountResponse>(environment.arreev_api_host + '/account?sub=' + sub )
      .concatMap( r => {
        return Observable.of( r.account );
      } );

    return observable;
  }

  /**
   *
   * @param {Account} account
   * @returns {Observable<Account>}
   */
  postAccount( account: Account ) : Observable<Account> {
    const body = JSON.stringify( account );

    const observable = this.http
      .post<AccountResponse>(environment.arreev_api_host + '/account',body )
      .concatMap( r => {
        return Observable.of( r.account );
      } );

    return observable;
  }

  /**
   *
   * @param {string} id
   * @returns {Observable<Fleet>}
   */
  getFleet( id:string ) : Observable<Fleet> {
    const observable = this.http
      .get<FleetResponse>(environment.arreev_api_host + '/fleet?id=' + id )
      .concatMap( r => {
        return Observable.of( r.fleet );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @returns {Observable<Fleet>}
   */
  getFleets( ownerid:string ) : Observable<Fleet> {
    const observable = this.http
      .get<FleetsResponse>(environment.arreev_api_host + '/fleets?ownerid=' + ownerid )
      .concatMap( r => {
        return Observable.from( r.fleets );
      } );

    return observable;
  }

  /**
   * in body, if fleet.id != null, then it affects an update ... if fleet.id == null, then affects a create
   *
   * @param {string} ownerid
   * @param {Fleet} fleet
   * @returns {Observable<Fleet>}
   */
  postFleet( ownerid:string,fleet:Fleet ) : Observable<Fleet> {
    const body = JSON.stringify( fleet );

    const observable = this.http
      .post<FleetResponse>(environment.arreev_api_host + '/fleet?ownerid=' + ownerid,body )
      .concatMap( r => {
        return Observable.of( r.fleet );
      } );

    return observable;
  }

  /**
   *
   * @param {string} id
   * @returns {Observable<Transporter>}
   */
  getTransporter( id:string ) : Observable<Transporter> {
    const url = environment.arreev_api_host + '/transporter?id='+id;
    const observable = this.http
      .get<TransporterResponse>( url )
      .concatMap( r => {
        return Observable.of( r.transporter );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} fleetid
   * @returns {Observable<Transporter>}
   */
  getTransporters( ownerid:string,fleetid:string ) : Observable<Transporter> {
    const url = environment.arreev_api_host + '/transporters?ownerid='+ownerid+'&fleetid='+fleetid;

    const observable = this.http
      .get<TransportersResponse>( url )
      .concatMap( r => {
        return Observable.from( r.transporters );
      } );

    return observable;
  }

  /**
   * in body, if transporter.id != null, then it affects an update ... if transporter.id == null, then affects a create
   * to create, must also pass a fleetid
   *
   * @param {string} ownerid
   * @param {string} fleetid
   * @param {Transporter} transporter
   * @returns {Observable<Transporter>}
   */
  postTransporter( ownerid:string,fleetid:string,transporter:Transporter ) : Observable<Transporter> {
    const body = JSON.stringify( transporter );

    const url = environment.arreev_api_host + '/transporter?ownerid='+ownerid + ( fleetid != null ? '&fleetid='+fleetid : '' );
    const observable = this.http
      .post<TransporterResponse>( url,body )
      .concatMap( r => {
        return Observable.of( r.transporter );
      } );

    return observable;
  }

  /**
   *
   * @param {string} id
   * @returns {Observable<Follow>}
   */
  getFollow( id:string ) : Observable<Follow> {
    const url = environment.arreev_api_host + '/follow?id='+id;
    const observable = this.http
      .get<FollowResponse>( url )
      .concatMap( r => {
        return Observable.of( r.follow );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} fleetid
   * @param {string} transporterid
   * @returns {Observable<Follow>}
   */
  getFollows( ownerid:string,fleetid:string,transporterid:string ) : Observable<Follow> {
    const url = environment.arreev_api_host + '/follows?ownerid='+ownerid+'&fleetid='+fleetid+'&transporterid='+transporterid;

    const observable = this.http
      .get<FollowsResponse>( url )
      .concatMap( r => {
        return Observable.from( r.follows );
      } );

    return observable;
  }

  /**
   * in body, if follow.id != null, then it affects an update ... if follow.id == null, then affects a create
   * to create, must also pass a fleetid and transporterid
   *
   * @param {string} ownerid
   * @param {string} fleetid
   * @param {string} transporterid
   * @param {Follow} follow
   * @returns {Observable<Follow>}
   */
  postFollow( ownerid:string,fleetid:string,transporterid:string,follow:Follow ) : Observable<Follow> {
    const body = JSON.stringify( follow );

    const url = environment.arreev_api_host + '/follow?ownerid='+ownerid +
      (fleetid != null ? '&fleetid='+fleetid : '') +
      (transporterid != null ? '&transporterid='+transporterid : '');

    const observable = this.http
      .post<FollowResponse>( url,body )
      .concatMap( r => {
        return Observable.of( r.follow );
      } );

    return observable;
  }
}
