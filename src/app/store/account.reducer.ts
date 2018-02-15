
import * as AccountActions from './account.actions';
import { Account } from '../model/account';

export type Action = AccountActions.All;

const defaultState: Account = {};

const newState = ( state,newData ) => {
  return Object.assign( {},state,newData );
};

export function accountReducer( state:Account=defaultState,action:Action ) {
  switch ( action.type ) {
    case AccountActions.ACCOUNT:
      return newState( state,action.account );
    case AccountActions.PENDINGACCOUNT:
      return state; // dont change here, it is pending only
    default:
      return state;
  }
}
