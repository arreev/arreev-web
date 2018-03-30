
import { Waypoint } from '../model/waypoint';
import { Action } from '@ngrx/store';

export const WAYPOINT_POST           = 'WAYPOINT_POST';
export const WAYPOINT_FETCH          = 'WAYPOINT_FETCH';
export const WAYPOINT_FETCHED        = 'WAYPOINT_FETCHED';

export class WaypointPostAction implements Action
{
  readonly type = WAYPOINT_POST;
  constructor( public ownerid:string,public waypoint:Waypoint ) {}
}

export class WaypointFetchAction implements Action
{
  readonly type = WAYPOINT_FETCH;
  constructor( public id:string ) {}
}

export class WaypointFetchedAction implements Action
{
  readonly type = WAYPOINT_FETCHED;
  constructor( public waypoint:Waypoint ) {}
}

export type All = WaypointPostAction | WaypointFetchAction | WaypointFetchedAction;
