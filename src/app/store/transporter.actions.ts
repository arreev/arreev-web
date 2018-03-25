
import { Transporter } from '../model/transporter';
import { Action } from '@ngrx/store';

export const TRANSPORTER_POST           = 'TRANSPORTER_POST';
export const TRANSPORTER_FETCH          = 'TRANSPORTER_FETCH';
export const TRANSPORTER_FETCHED        = 'TRANSPORTER_FETCHED';
export const TRANSPORTER_DELETE         = 'TRANSPORTER_DELETE';
export const TRANSPORTER_DELETED        = 'TRANSPORTER_DELETED';

export class TransporterPostAction implements Action
{
  readonly type = TRANSPORTER_POST;
  constructor( public ownerid:string,public transporter:Transporter ) {}
}

export class TransporterFetchAction implements Action
{
  readonly type = TRANSPORTER_FETCH;
  constructor( public id:string ) {}
}

export class TransporterFetchedAction implements Action
{
  readonly type = TRANSPORTER_FETCHED;
  constructor( public transporter:Transporter ) {}
}

export class TransporterDeleteAction implements Action
{
  readonly type = TRANSPORTER_DELETE;
  constructor( public ownerid:string,public id:string ) {}
}

export class TransporterDeletedAction implements Action
{
  readonly type = TRANSPORTER_DELETED;
  constructor() {}
}

export type All = TransporterPostAction | TransporterFetchAction | TransporterFetchedAction | TransporterDeleteAction | TransporterDeletedAction;
