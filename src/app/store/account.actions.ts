
import { Account } from '../model/account';
import { Action } from '@ngrx/store';

export const ACCOUNT          = 'PERSISTENT_ACCOUNT';
export const PENDINGACCOUNT   = 'PERSISTENT_PENDINGACCOUNT';

export class AccountAction implements Action
{
  readonly type = ACCOUNT;
  constructor( public account:Account ) {}
}

export class PendingAccountAction implements Action
{
  readonly type = PENDINGACCOUNT;
  constructor( public pending:Account ) {}
}

export type All = AccountAction | PendingAccountAction;
