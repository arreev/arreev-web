
import { Route } from '../model/route';
import { Action } from '@ngrx/store';

export const ROUTE_POST           = 'ROUTE_POST';
export const ROUTE_FETCH          = 'ROUTE_FETCH';
export const ROUTE_FETCHED        = 'ROUTE_FETCHED';
export const ROUTE_DELETE         = 'ROUTE_DELETE';
export const ROUTE_DELETED        = 'ROUTE_DELETED';

export class RoutePostAction implements Action
{
  readonly type = ROUTE_POST;
  constructor( public ownerid:string,public route:Route ) {}
}

export class RouteFetchAction implements Action
{
  readonly type = ROUTE_FETCH;
  constructor( public id:string ) {}
}

export class RouteFetchedAction implements Action
{
  readonly type = ROUTE_FETCHED;
  constructor( public route:Route ) {}
}

export class RouteDeleteAction implements Action
{
  readonly type = ROUTE_DELETE;
  constructor( public ownerid:string,public id:string ) {}
}

export class RouteDeletedAction implements Action
{
  readonly type = ROUTE_DELETED;
  constructor() {}
}

export type All = RoutePostAction | RouteFetchAction | RouteFetchedAction | RouteDeleteAction | RouteDeletedAction;
