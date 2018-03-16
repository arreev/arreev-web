
import { Follow } from '../model/follow';
import { Action } from '@ngrx/store';

export const FOLLOW_POST           = 'FOLLOW_POST';
export const FOLLOW_FETCH          = 'FOLLOW_FETCH';
export const FOLLOW_FETCHED        = 'FOLLOW_FETCHED';

export class FollowPostAction implements Action
{
  readonly type = FOLLOW_POST;
  constructor( public ownerid:string,public follow:Follow ) {}
}

export class FollowFetchAction implements Action
{
  readonly type = FOLLOW_FETCH;
  constructor( public id:string ) {}
}

export class FollowFetchedAction implements Action
{
  readonly type = FOLLOW_FETCHED;
  constructor( public follow:Follow ) {}
}

export type All = FollowPostAction | FollowFetchAction | FollowFetchedAction;
