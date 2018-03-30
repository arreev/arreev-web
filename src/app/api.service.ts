
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Authentication } from './authentication.service';
import { Transporter } from './model/transporter';
import { Observable } from 'rxjs/Observable';
import { Waypoint } from './model/waypoint';
import { Injectable } from '@angular/core';
import { Account } from './model/account';
import { Follow } from './model/follow';
import { JWTToken } from './jwt-token';
import { Route } from './model/route';
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
class RoutesResponse extends APIResponse { routes?: Route[] = null; }
class RouteResponse extends APIResponse { route?: Route = null; }
class WaypointsResponse extends Response { waypoints?: Waypoint [] = null; }
class WaypointResponse extends Response { waypoint?: Waypoint = null; }
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
   * @param {string} ownerid
   * @param {string} id
   * @returns {Observable<Boolean>}
   */
  deleteFleet( ownerid:string,id:string ) : Observable<Boolean> {
    const observable = this.http
      .delete<FleetResponse>(environment.arreev_api_host + '/fleet?ownerid=' + ownerid + '&id=' + id )
      .concatMap( r => {
        return Observable.of( true );
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
   * @param {string} ownerid
   * @param {string} id
   * @returns {Observable<Boolean>}
   */
  deleteTransporter( ownerid:string,id:string ) : Observable<Boolean> {
    const observable = this.http
      .delete<TransporterResponse>(environment.arreev_api_host + '/transporter?ownerid=' + ownerid + '&id=' + id )
      .concatMap( r => {
        return Observable.of( true );
      } );
    return observable;
  }

  /**
   *
   * @param {string} id
   * @returns {Observable<Route>}
   */
  getRoute( id:string ) : Observable<Route> {
    const observable = this.http
      .get<RouteResponse>(environment.arreev_api_host + '/route?id=' + id )
      .concatMap( r => {
        return Observable.of( r.route );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @returns {Observable<Route>}
   */
  getRoutes( ownerid:string ) : Observable<Route> {
    const observable = this.http
      .get<RoutesResponse>(environment.arreev_api_host + '/routes?ownerid=' + ownerid )
      .concatMap( r => {
        return Observable.from( r.routes );
      } );

    return observable;
  }

  /**
   * in body, if route.id != null, then it affects an update ... if route.id == null, then affects a create
   *
   * @param {string} ownerid
   * @param {Route} route
   * @returns {Observable<Route>}
   */
  postRoute( ownerid:string,route:Route ) : Observable<Route> {
    const body = JSON.stringify( route );

    const observable = this.http
      .post<RouteResponse>(environment.arreev_api_host + '/route?ownerid=' + ownerid,body )
      .concatMap( r => {
        return Observable.of( r.route );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} id
   * @returns {Observable<Boolean>}
   */
  deleteRoute( ownerid:string,id:string ) : Observable<Boolean> {
    const observable = this.http
      .delete<RouteResponse>(environment.arreev_api_host + '/route?ownerid=' + ownerid + '&id=' + id )
      .concatMap( r => {
        return Observable.of( true );
      } );
    return observable;
  }

  /**
   *
   * @param {string} id
   * @returns {Observable<Waypoint>}
   */
  getWaypoint( id:string ) : Observable<Waypoint> {
    const observable = this.http
      .get<WaypointResponse>(environment.arreev_api_host + '/waypoint?id=' + id )
      .concatMap( r => {
        return Observable.of( r.waypoint );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} routeid
   * @returns {Observable<Waypoint>}
   */
  getWaypoints( ownerid:string,routeid:string ) : Observable<Waypoint> {
    const observable = this.http
      .get<WaypointsResponse>(environment.arreev_api_host + '/waypoints?ownerid=' + ownerid + '&routeid=' + routeid )
      .concatMap( r => {
        return Observable.from( r.waypoints );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} routeid
   * @param {Waypoint} waypoint
   * @returns {Observable<Waypoint>}
   */
  postWaypoint( ownerid:string,routeid:string,waypoint:Waypoint ) : Observable<Waypoint> {
    const body = JSON.stringify( waypoint );

    const observable = this.http
      .post<WaypointResponse>(environment.arreev_api_host + '/waypoint?ownerid=' + ownerid + '&routeid=' + routeid,body )
      .concatMap( r => {
        return Observable.of( r.waypoint );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} id
   * @returns {Observable<Boolean>}
   */
  deleteWaypoint( ownerid:string,id:string ) : Observable<Boolean> {
    const observable = this.http
      .delete<WaypointResponse>(environment.arreev_api_host + '/waypoint?ownerid=' + ownerid + '&id=' + id )
      .concatMap( r => {
        return Observable.of( true );
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
