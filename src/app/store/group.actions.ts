
import { Group } from '../model/group';
import { Action } from '@ngrx/store';

export const QUERY        = 'GROUP.QUERY';
export const QUERIED      = 'GROUP.QUERIED';
export const CREATE       = 'GROUP.CREATE';
export const CREATED      = 'GROUP.CREATED';
export const UPDATE       = 'GROUP.UPDATE';
export const UPDATED      = 'GROUP.UPDATED';
export const IMAGINE      = 'GROUP.IMAGINE';
export const IMAGINED     = 'GROUP.IMAGINED';
export const DELETE       = 'GROUP.DELETE';
export const DELETED      = 'GROUP.DELETED';
export const PENDING      = 'GROUP.PENDING';

export class Query implements Action
{
  readonly type = QUERY;
  constructor( public ownerid:string,public _type:string,public start:number=0,public count:number=100 ) {}
}
export class Queried implements Action
{
  readonly type = QUERIED;
  constructor( public groups:Group[] ) {}
}

export class Create implements Action
{
  readonly type = CREATE;
  constructor( public ownerid:string,public partial:Partial<Group>,public imagefile:File ) {}
}
export class Created implements Action
{
  readonly type = CREATED;
  constructor( public group:Group ) {}
}

export class Update implements Action
{
  readonly type = UPDATE;
  constructor( public ownerid:string,public id:string,public partial:Partial<Group> ) {
  }
}
export class Updated implements Action
{
  readonly type = UPDATED;
  constructor( public id:string,public group:Group ) {
    console.log( '[UPDATED] ' + id + ' ' + group.name );
  }
}

export class Imagine implements Action
{
  readonly type = IMAGINE;
  constructor( public ownerid:string,public id:string,public partial:Partial<Group>,public imagefile:File ) {}
}
export class Imagined implements Action
{
  readonly type = IMAGINED;
  constructor( public id:string,public group:Group ) {}
}

export class Delete implements Action
{
  readonly type = DELETE;
  constructor( public ownerid:string,public id:string ) {}
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

export type GroupActions = Query | Queried | Create | Created | Imagine | Imagined | Update | Updated | Delete | Deleted | Pending;

