
import { createEntityAdapter,EntityState } from '@ngrx/entity';
import { createFeatureSelector } from '@ngrx/store';
import * as actions from './group.actions';
import { Group } from '../model/group';

export const groupAdapter = createEntityAdapter<Group>();
export interface State extends EntityState<Group> {}

const defaultGroup = {};
export const initialState: State = groupAdapter.getInitialState( defaultGroup );

/**
 *
 * @param {State} state
 * @param {GroupActions} action
 * @returns {State}
 */
export function groupReducer( state: State = initialState,action: actions.GroupActions ) {
  switch ( action.type ) {

    case actions.QUERY:
      return state;

    case actions.QUERIED:
      return groupAdapter.addAll( action.groups,state ); // replace current collection with provided collection

    case actions.CREATE:
      return state;

    case actions.CREATED:
      return groupAdapter.addOne( action.group,state );

    case actions.UPDATE:
      return state;

    case actions.UPDATED:
      return groupAdapter.updateOne({ id:action.id,changes:action.group },state );

    case actions.IMAGINE:
        return state;

    case actions.IMAGINED:
      return groupAdapter.updateOne({ id:action.id,changes:action.group },state );

    case actions.DELETE:
      return state;

    case actions.DELETED:
      return groupAdapter.removeOne( action.id,state );

    default:
      return state;
  }
}

export const getGroupState = createFeatureSelector<State>('group' );

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = groupAdapter.getSelectors( getGroupState );
