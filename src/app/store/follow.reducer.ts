
import * as FollowActions from './follow.actions';
import { Follow } from '../model/follow';

export type Action = FollowActions.All;

const defaultFollowState: Follow = {};

export function followReducer( state:Follow=defaultFollowState,action:Action ) {
  switch ( action.type ) {
    case FollowActions.FOLLOW_POST:
      return Object.assign({},state,action.follow ); // builds left-to-right, will take only non-nulls from follow.action and these will override {} and state
    case FollowActions.FOLLOW_FETCH:
      return state;
    case FollowActions.FOLLOW_FETCHED:
      return Object.assign({},state,action.follow ); // builds left-to-right, will take only non-nulls from follow.action and these will override {} and state
    default:
      return state;
  }
}
