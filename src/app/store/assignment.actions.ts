
import { Assignment } from '../model/assignment';
import { Action } from '@ngrx/store';

export const ASSIGNMENT_POST           = 'ASSIGNMENT_POST';
export const ASSIGNMENT_FETCH          = 'ASSIGNMENT_FETCH';
export const ASSIGNMENT_FETCHED        = 'ASSIGNMENT_FETCHED';

export class AssignmentPostAction implements Action
{
  readonly type = ASSIGNMENT_POST;
  constructor( public ownerid:string,public assignment:Assignment ) {}
}

export class AssignmentFetchAction implements Action
{
  readonly type = ASSIGNMENT_FETCH;
  constructor( public id:string ) {}
}

export class AssignmentFetchedAction implements Action
{
  readonly type = ASSIGNMENT_FETCHED;
  constructor( public assignment:Assignment ) {}
}

export type All = AssignmentPostAction | AssignmentFetchAction | AssignmentFetchedAction;
