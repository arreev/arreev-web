
import { Account } from '../model/account';
import { Action } from '@ngrx/store';

export const ACCOUNT_POST           = 'ACCOUNT_POST';
export const ACCOUNT_FETCH          = 'ACCOUNT_FETCH';
export const ACCOUNT_FETCHED        = 'ACCOUNT_FETCHED';
export const ACCOUNT_RESET          = 'ACCOUNT_RESET';

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

export class AccountResetAction implements Action
{
  readonly type = ACCOUNT_RESET;
  constructor() {}
}

export type All = AccountPostAction | AccountFetchAction | AccountFetchedAction | AccountResetAction;
