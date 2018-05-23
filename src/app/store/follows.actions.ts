
import { Follow } from '../model/follow';
import { Action } from '@ngrx/store';

export const QUERY        = 'FOLLOWS.QUERY';
export const QUERIED      = 'FOLLOWS.QUERIED';
export const CREATE       = 'FOLLOWS.CREATE';
export const CREATED      = 'FOLLOWS.CREATED';
export const UPDATE       = 'FOLLOWS.UPDATE';
export const UPDATED      = 'FOLLOWS.UPDATED';
export const DELETE       = 'FOLLOWS.DELETE';
export const DELETED      = 'FOLLOWS.DELETED';
export const PENDING      = 'FOLLOWS.PENDING';

export class Query implements Action
{
  readonly type = QUERY;
  constructor( public ownerid:string,public fleetid:string,public start:number=0,public count:number=100 ) {}
}
export class Queried implements Action
{
  readonly type = QUERIED;
  constructor( public follows:Follow[] ) {}
}

export class Create implements Action
{
  readonly type = CREATE;
  constructor( public ownerid:string,public fleetid:string,public partial:Partial<Follow> ) {}
}
export class Created implements Action
{
  readonly type = CREATED;
  constructor( public follow:Follow ) {}
}

export class Update implements Action
{
  readonly type = UPDATE;
  constructor( public ownerid:string,public fleetid:string,public partial:Partial<Follow> ) {}
}
export class Updated implements Action
{
  readonly type = UPDATED;
  constructor( public id:string,public follow:Follow ) {}
}

export class Delete implements Action
{
  readonly type = DELETE;
  constructor( public ownerid:string,public id:string ) {}
}
export class Deleted implements Action
{
  readonly type = DELETED;
  constructor( public id:string ) { console.log( 'FOLLOW DELETED ' + id ); }
}

export class Pending implements Action
{
  readonly type = PENDING;
}

export type FollowsActions = Query | Queried | Create | Created | Update | Updated | Delete | Deleted | Pending;

