
import { Transporter } from '../model/transporter';
import { Action } from '@ngrx/store';

export const TRANSPORTER_POST           = 'TRANSPORTER_POST';
export const TRANSPORTER_FETCH          = 'TRANSPORTER_FETCH';
export const TRANSPORTER_FETCHED        = 'TRANSPORTER_FETCHED';

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

export type All = TransporterPostAction | TransporterFetchAction | TransporterFetchedAction;
