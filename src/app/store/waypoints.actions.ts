
import { Waypoint } from '../model/waypoint';
import { Action } from '@ngrx/store';

export const QUERY        = 'WAYPOINTS.QUERY';
export const QUERIED      = 'WAYPOINTS.QUERIED';
export const CREATE       = 'WAYPOINTS.CREATE';
export const CREATED      = 'WAYPOINTS.CREATED';
export const UPDATE       = 'WAYPOINTS.UPDATE';
export const UPDATED      = 'WAYPOINTS.UPDATED';
export const IMAGINE      = 'WAYPOINTS.IMAGINE';
export const IMAGINED     = 'WAYPOINTS.IMAGINED';
export const DELETE       = 'WAYPOINTS.DELETE';
export const DELETED      = 'WAYPOINTS.DELETED';
export const PENDING      = 'WAYPOINTS.PENDING';

export class Query implements Action
{
  readonly type = QUERY;
  constructor( public ownerid:string,public routeid:string,public start:number=0,public count:number=100 ) {}
}
export class Queried implements Action
{
  readonly type = QUERIED;
  constructor( public waypoints:Waypoint[] ) {}
}

export class Create implements Action
{
  readonly type = CREATE;
  constructor( public ownerid:string,public routeid:string,public partial:Partial<Waypoint>,public imagefile:File ) {}
}
export class Created implements Action
{
  readonly type = CREATED;
  constructor( public waypoint:Waypoint ) {}
}

export class Update implements Action
{
  readonly type = UPDATE;
  constructor( public ownerid:string,public routeid:string,public partial:Partial<Waypoint> ) {}
}
export class Updated implements Action
{
  readonly type = UPDATED;
  constructor( public id:string,public waypoint:Waypoint ) {}
}

export class Imagine implements Action
{
  readonly type = IMAGINE;
  constructor( public ownerid:string,public id:string,public partial:Partial<Waypoint>,public imagefile:File ) {}
}
export class Imagined implements Action
{
  readonly type = IMAGINED;
  constructor( public id:string,public waypoint:Waypoint ) {}
}

export class Delete implements Action
{
  readonly type = DELETE;
  constructor( public ownerid:string,public id:string ) {}
}
export class Deleted implements Action
{
  readonly type = DELETED;
  constructor( public id:string ) { console.log( 'WAYPOINT DELETED ' + id ); }
}

export class Pending implements Action
{
  readonly type = PENDING;
}

export type WaypointsActions = Query | Queried | Create | Created | Imagine | Imagined | Update | Updated | Delete | Deleted | Pending;

