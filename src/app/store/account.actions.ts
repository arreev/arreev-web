
import { Account } from '../model/account';
import { Action } from '@ngrx/store';

export const ACCOUNT_POST           = 'ACCOUNT_POST';
export const ACCOUNT_FETCH          = 'ACCOUNT_FETCH';
export const ACCOUNT_FETCHED        = 'ACCOUNT_FETCHED';

export class AccountPostAction implements Action
{
  readonly type = ACCOUNT_POST;
  constructor( public account:Account ) {}
}

export class AccountFetchAction implements Action
{
  readonly type = ACCOUNT_FETCH;
  constructor() {}
}

export class AccountFetchedAction implements Action
{
  readonly type = ACCOUNT_FETCHED;
  constructor( public account:Account ) {}
}

export type All = AccountPostAction | AccountFetchAction | AccountFetchedAction;
