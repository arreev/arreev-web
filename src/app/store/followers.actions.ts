
import { Follower } from '../model/follower';
import { Action } from '@ngrx/store';

export const QUERY        = 'FOLLOWERS.QUERY';
export const QUERIED      = 'FOLLOWERS.QUERIED';
export const CREATE       = 'FOLLOWERS.CREATE';
export const CREATED      = 'FOLLOWERS.CREATED';
export const UPDATE       = 'FOLLOWERS.UPDATE';
export const UPDATED      = 'FOLLOWERS.UPDATED';
export const DELETE       = 'FOLLOWERS.DELETE';
export const DELETED      = 'FOLLOWERS.DELETED';
export const PENDING      = 'FOLLOWERS.PENDING';

export class Query implements Action
{
  readonly type = QUERY;
  constructor() {}
}
export class Queried implements Action
{
  readonly type = QUERIED;
  constructor() {}
}

export class Create implements Action
{
  readonly type = CREATE;
  constructor( public partial:Partial<Follower> ) {}
}
export class Created implements Action
{
  readonly type = CREATED;
  constructor( public follower:Follower ) {}
}

export class Update implements Action
{
  readonly type = UPDATE;
  constructor( public partial:Partial<Follower> ) {}
}
export class Updated implements Action
{
  readonly type = UPDATED;
  constructor( public id:string,public follower:Follower ) {}
}

export class Delete implements Action
{
  readonly type = DELETE;
  constructor( public id:string ) {}
}
export class Deleted implements Action
{
  readonly type = DELETED;
  constructor( public id:string ) {}
}

export class Pending implements Action
{
  readonly type = PENDING;
}

export type FollowersActions = Query | Queried | Create | Created | Update | Updated | Delete | Deleted | Pending;

