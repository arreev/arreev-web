
import { createEntityAdapter,EntityState } from '@ngrx/entity';
import { createFeatureSelector } from '@ngrx/store';
import * as actions from './followers.actions';
import { Follower } from '../model/follower';

export const followersAdapter = createEntityAdapter<Follower>();
export interface State extends EntityState<Follower> {}

const defaultFollower = {};
export const initialState: State = followersAdapter.getInitialState( defaultFollower );

/**
 *
 * @param {State} state
 * @param {FollowersActions} action
 * @returns {State}
 */
export function followersReducer( state: State = initialState,action: actions.FollowersActions ) {
  switch ( action.type ) {

    case actions.QUERY:
      return state;

    case actions.QUERIED:
      return state;

    case actions.CREATE:
      return state;

    case actions.CREATED:
      return followersAdapter.addOne( action.follower,state );

    case actions.UPDATE:
      return state;

    case actions.UPDATED:
      return followersAdapter.upsertOne({ id:action.id,changes:action.follower },state );

    case actions.DELETE:
      return state;

    case actions.DELETED:
      return followersAdapter.removeOne( action.id,state );

    default:
      return state;
  }
}

export const getFollowersState = createFeatureSelector<State>('followers' );

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = followersAdapter.getSelectors( getFollowersState );
