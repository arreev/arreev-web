
import { Fleet } from '../model/fleet';
import { Action } from '@ngrx/store';

export const FLEET_POST           = 'FLEET_POST';
export const FLEET_FETCH          = 'FLEET_FETCH';
export const FLEET_FETCHED        = 'FLEET_FETCHED';
export const FLEET_DELETE         = 'FLEET_DELETE';
export const FLEET_DELETED        = 'FLEET_DELETED';

export class FleetPostAction implements Action
{
  readonly type = FLEET_POST;
  constructor( public ownerid:string,public fleet:Fleet ) {}
}

export class FleetFetchAction implements Action
{
  readonly type = FLEET_FETCH;
  constructor( public id:string ) {}
}

export class FleetFetchedAction implements Action
{
  readonly type = FLEET_FETCHED;
  constructor( public fleet:Fleet ) {}
}

export class FleetDeleteAction implements Action
{
  readonly type = FLEET_DELETE;
  constructor( public ownerid:string,public id:string ) {}
}

export class FleetDeletedAction implements Action
{
  readonly type = FLEET_DELETED;
  constructor() {}
}

export type All = FleetPostAction | FleetFetchAction | FleetFetchedAction | FleetDeleteAction | FleetDeletedAction;
