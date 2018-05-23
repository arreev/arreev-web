
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Transporter } from './model/transporter';
import { Assignment } from './model/assignment';
import { Observable } from 'rxjs/Observable';
import { Waypoint } from './model/waypoint';
import { Injectable } from '@angular/core';
import { Person } from './model/person';
import { Follow } from './model/follow';
import { JWTToken } from './jwt-token';
import { Route } from './model/route';
import { Group } from './model/group';
import { Fleet } from './model/fleet';

import { environment } from '../environments/environment';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/concatMap';
import { isNullOrUndefined } from 'util';

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
class WaypointResponse extends Response { waypoint?: Waypoint = null; id?: string = null; }
class AssignmentsResponse extends APIResponse { assignments?: Assignment[] = null; }
class AssignmentResponse extends APIResponse { assignment?: Assignment = null; }
class FollowResponse extends APIResponse { follow?: Follow = null; id?: string = null; }
class FollowsResponse extends APIResponse { follows?: Follow[] = null; }
class GroupsResponse extends APIResponse { groups?: Group[] = null; }
class GroupResponse extends APIResponse { group?: Group = null; id?: string = null; }
class PersonsResponse extends APIResponse { persons?: Person[] = null; }
class PersonResponse extends APIResponse { person?: Person = null; id?: string = null; }

class StorageMetadata
{
  name?: string;
}

@Injectable()
export class API
{
  constructor( private http:HttpClient ) {}

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
    this.assertOwnerId( ownerid );

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
    this.assertOwnerId( ownerid );

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
    this.assertOwnerId( ownerid );

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
    this.assertOwnerId( ownerid );

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
    this.assertOwnerId( ownerid );

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
    this.assertOwnerId( ownerid );

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
    this.assertOwnerId( ownerid );

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
    this.assertOwnerId( ownerid );

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
    this.assertOwnerId( ownerid );

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
    this.assertOwnerId( ownerid );

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
   * @param {string} type
   * @returns {Observable<Waypoint[]>}
   */
  getWaypointsArray( ownerid:string,routeid:string ) : Observable<Waypoint[]> {
    this.assertOwnerId( ownerid );

    const observable = this.http
      .get<WaypointsResponse>(environment.arreev_api_host + '/waypoints?ownerid=' + ownerid + '&routeid=' + routeid )
      .concatMap( r => {
        return Observable.of( r.waypoints );
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
    this.assertOwnerId( ownerid );

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
  deleteWaypoint( ownerid:string,id:string ) : Observable<string> {
    this.assertOwnerId( ownerid );

    const observable = this.http
      .delete<WaypointResponse>(environment.arreev_api_host + '/waypoint?ownerid=' + ownerid + '&id=' + id )
      .concatMap( r => {
        return Observable.of( r.id );
      } );
    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} type
   * @param {string} routeid
   * @returns {Observable<string>}
   */
  getAssignments( ownerid:string,type:string,routeid:string ) : Observable<Assignment> {
    this.assertOwnerId( ownerid );

    const observable = this.http
      .get<AssignmentsResponse>(environment.arreev_api_host + '/assignments?ownerid=' + ownerid + '&type=' + type + '&routeid=' + routeid )
      .concatMap( r => {
        return Observable.from( r.assignments );
      } );
    return observable;
  }

  /**
   *
   * @param {string} id
   * @returns {Observable<Assignment>}
   */
  getAssignment( id:string ) : Observable<Assignment> {
    const observable = this.http
      .get<AssignmentResponse>(environment.arreev_api_host + '/assignment?id=' + id )
      .concatMap( r => {
        return Observable.of( r.assignment );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {Assignment} assignment
   * @returns {Observable<Assignment>}
   */
  postAssignment( ownerid:string,assignment:Assignment ) : Observable<Assignment> {
    this.assertOwnerId( ownerid );

    const body = JSON.stringify( assignment );

    const url = environment.arreev_api_host + '/assignment?ownerid='+ownerid;

    const observable = this.http
      .post<AssignmentResponse>( url,body )
      .concatMap( r => {
        return Observable.of( r.assignment );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} id
   * @returns {Observable<Boolean>}
   */
  deleteAssignment( ownerid:string,id:string ) : Observable<Boolean> {
    this.assertOwnerId( ownerid );

    const observable = this.http
      .delete<WaypointResponse>(environment.arreev_api_host + '/assignment?ownerid=' + ownerid + '&id=' + id )
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
   * @returns {Observable<Follow[]>}
   */
  getFollowsArray( ownerid:string,fleetid:string ) : Observable<Follow[]> {
    this.assertOwnerId( ownerid );

    const url = environment.arreev_api_host + '/follows?ownerid='+ownerid+'&fleetid='+fleetid;
    const observable = this.http
      .get<FollowsResponse>( url )
      .concatMap( r => {
        return Observable.of( r.follows );
      } );
    return observable;
  }

  /**
   * in body, if follow.id != null, then it affects an update ... if follow.id == null, then affects a create
   * to create, must also pass a fleetid
   *
   * @param {string} ownerid
   * @param {string} fleetid
   * @param {string} transporterid
   * @param {Follow} follow
   * @returns {Observable<Follow>}
   */
  postFollow( ownerid:string,fleetid:string,follow:Follow ) : Observable<Follow> {
    this.assertOwnerId( ownerid );

    const body = JSON.stringify( follow );
    const url = environment.arreev_api_host + '/follow?ownerid='+ownerid+'&fleetid='+fleetid;
    const observable = this.http
      .post<FollowResponse>( url,body )
      .concatMap( r => {
        return Observable.of( r.follow );
      } );
    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} id
   * @returns {Observable<string>}
   */
  deleteFollow( ownerid:string,id:string ) : Observable<string> {
    this.assertOwnerId( ownerid );

    const url = environment.arreev_api_host + '/follow?ownerid='+ownerid+'&id='+id;
    const observable = this.http
      .delete<FollowResponse>(url )
      .concatMap( r => {
        return Observable.of( r.id );
      } );
    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} type
   * @returns {Observable<Group>}
   */
  getGroups( ownerid:string,type:string ) : Observable<Group> {
    this.assertOwnerId( ownerid );

    const observable = this.http
      .get<GroupsResponse>(environment.arreev_api_host + '/groups?ownerid=' + ownerid + '&type=' + type )
      .concatMap( r => {
        return Observable.from( r.groups );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} type
   * @returns {Observable<Group[]>}
   */
  getGroupsArray( ownerid:string,type:string ) : Observable<Group[]> {
    this.assertOwnerId( ownerid );

    const observable = this.http
      .get<GroupsResponse>(environment.arreev_api_host + '/groups?ownerid=' + ownerid + '&type=' + type )
      .concatMap( r => {
        return Observable.of( r.groups );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {Group} group
   * @returns {Observable<Group>}
   */
  postGroup( ownerid:string,group:Group ) : Observable<Group> {
    this.assertOwnerId( ownerid );

    const body = JSON.stringify( group );

    const observable = this.http
      .post<GroupResponse>(environment.arreev_api_host + '/group?ownerid=' + ownerid,body )
      .concatMap( r => {
        return Observable.of( r.group );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} id
   * @returns {Observable<Boolean>}
   */
  deleteGroup( ownerid:string,id:string ) : Observable<string> {
    this.assertOwnerId( ownerid );

    const observable = this.http
      .delete<GroupResponse>(environment.arreev_api_host + '/group?ownerid=' + ownerid + '&id=' + id )
      .concatMap( r => {
        return Observable.of( r.id );
      } );
    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} groupid
   * @returns {Observable<Person>}
   */
  getPersons( ownerid:string,groupid:string ) : Observable<Person> {
    this.assertOwnerId( ownerid );

    const url = environment.arreev_api_host + '/persons?ownerid='+ownerid+'&groupid='+groupid;

    const observable = this.http
      .get<PersonsResponse>( url )
      .concatMap( r => {
        return Observable.from( r.persons );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} groupid
   * @returns {Observable<Person[]>}
   */
  getPersonsArray( ownerid:string,groupid:string ) : Observable<Person[]> {
    this.assertOwnerId( ownerid );

    const observable = this.http
      .get<PersonsResponse>( environment.arreev_api_host + '/persons?ownerid=' + ownerid + '&groupid=' + groupid )
      .concatMap( r => {
        return Observable.of( r.persons );
      } );

    return observable;
  }

  /**
   *
   * @param {string} id
   * @returns {Observable<Person>}
   */
  getPerson( id:string ) : Observable<Person> {
    const observable = this.http
      .get<PersonResponse>(environment.arreev_api_host + '/person?id=' + id )
      .concatMap( r => {
        return Observable.of( r.person );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} groupid
   * @param {Person} person
   * @returns {Observable<Person>}
   */
  postPerson( ownerid:string,groupid:string,person:Person ) : Observable<Person> {
    this.assertOwnerId( ownerid );

    const body = JSON.stringify( person );

    const observable = this.http
      .post<PersonResponse>(environment.arreev_api_host + '/person?ownerid=' + ownerid + '&groupid=' + groupid,body )
      .concatMap( r => {
        return Observable.of( r.person );
      } );

    return observable;
  }

  /**
   *
   * @param {string} ownerid
   * @param {string} id
   * @returns {Observable<string>}
   */
  deletePerson( ownerid:string,id:string ) : Observable<string> {
    this.assertOwnerId( ownerid );

    const observable = this.http
      .delete<PersonResponse>(environment.arreev_api_host + '/person?ownerid=' + ownerid + '&id=' + id )
      .concatMap( r => {
        return Observable.of( r.id );
      } );
    return observable;
  }

  private assertOwnerId( ownerid:string ) {
    if ( isNullOrUndefined( ownerid ) ) {
      throw new Error( 'ownerid of ' + ownerid );
    }
  }
}
