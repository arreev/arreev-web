
import { Account,dumpAccount } from '../model/account';
import * as AccountActions from './account.actions';

export type Action = AccountActions.All;

const defaultAccountState: Account = {};

export function accountReducer( state:Account=defaultAccountState,action:Action ) {
  switch ( action.type ) {
    case AccountActions.ACCOUNT_POST:
      return Object.assign({},state,action.account ); // builds left-to-right, will take only non-nulls from account.action and these will override {} and state
    case AccountActions.ACCOUNT_FETCH:
      return state;
    case AccountActions.ACCOUNT_FETCHED:
      return Object.assign({},state,action.account ); // builds left-to-right, will take only non-nulls from account.action and these will override {} and state
    default:
      return state;
  }
}
