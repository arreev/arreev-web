
import { Waypoint } from '../model/waypoint';
import { Action } from '@ngrx/store';

export const EDIT             = 'WAYPOINT.EDIT';

export class Edit implements Action
{
  readonly type = EDIT;
  constructor( public waypoint:Waypoint ) {}
}

export type All = Edit;
