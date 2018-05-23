
import { Person } from '../model/person';
import { Action } from '@ngrx/store';

export const QUERY        = 'PERSONS.QUERY';
export const QUERIED      = 'PERSONS.QUERIED';
export const CREATE       = 'PERSONS.CREATE';
export const CREATED      = 'PERSONS.CREATED';
export const UPDATE       = 'PERSONS.UPDATE';
export const UPDATED      = 'PERSONS.UPDATED';
export const IMAGINE      = 'PERSONS.IMAGINE';
export const IMAGINED     = 'PERSONS.IMAGINED';
export const DELETE       = 'PERSONS.DELETE';
export const DELETED      = 'PERSONS.DELETED';
export const PENDING      = 'PERSONS.PENDING';

export class Query implements Action
{
  readonly type = QUERY;
  constructor( public ownerid:string,public groupid:string,public start:number=0,public count:number=100 ) {}
}
export class Queried implements Action
{
  readonly type = QUERIED;
  constructor( public persons:Person[] ) {}
}

export class Create implements Action
{
  readonly type = CREATE;
  constructor( public ownerid:string,public groupid:string,public partial:Partial<Person>,public imagefile:File ) {}
}
export class Created implements Action
{
  readonly type = CREATED;
  constructor( public person:Person ) {}
}

export class Update implements Action
{
  readonly type = UPDATE;
  constructor( public ownerid:string,public groupid:string,public partial:Partial<Person> ) {}
}
export class Updated implements Action
{
  readonly type = UPDATED;
  constructor( public id:string,public person:Person ) {}
}

export class Imagine implements Action
{
  readonly type = IMAGINE;
  constructor( public ownerid:string,public id:string,public partial:Partial<Person>,public imagefile:File ) {}
}
export class Imagined implements Action
{
  readonly type = IMAGINED;
  constructor( public id:string,public person:Person ) {}
}

export class Delete implements Action
{
  readonly type = DELETE;
  constructor( public ownerid:string,public id:string ) {}
}
export class Deleted implements Action
{
  readonly type = DELETED;
  constructor( public id:string ) { console.log( 'PERSON DELETED ' + id ); }
}

export class Pending implements Action
{
  readonly type = PENDING;
}

export type PersonsActions = Query | Queried | Create | Created | Imagine | Imagined | Update | Updated | Delete | Deleted | Pending;

