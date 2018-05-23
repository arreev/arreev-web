
import { createEntityAdapter,EntityState } from '@ngrx/entity';
import { createFeatureSelector } from '@ngrx/store';
import * as actions from './follows.actions';
import { Follow } from '../model/follow';

export const followsAdapter = createEntityAdapter<Follow>();
export interface State extends EntityState<Follow> {}

const defaultFollow = {};
export const initialState: State = followsAdapter.getInitialState( defaultFollow );

/**
 *
 * @param {State} state
 * @param {FollowsActions} action
 * @returns {State}
 */
export function followsReducer( state: State = initialState,action: actions.FollowsActions ) {
  switch ( action.type ) {

    case actions.QUERY:
      return state;

    case actions.QUERIED:
      return followsAdapter.addAll( action.follows,state ); // replace current collection with provided collection

    case actions.CREATE:
      return state;

    case actions.CREATED:
      return followsAdapter.addOne( action.follow,state );

    case actions.UPDATE:
      return state;

    case actions.UPDATED:
      return followsAdapter.updateOne({ id:action.id,changes:action.follow },state );

    case actions.DELETE:
      return state;

    case actions.DELETED:
      return followsAdapter.removeOne( action.id,state );

    default:
      return state;
  }
}

export const getFollowsState = createFeatureSelector<State>('follows' );

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = followsAdapter.getSelectors( getFollowsState );
