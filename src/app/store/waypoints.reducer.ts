
import { createEntityAdapter,EntityState } from '@ngrx/entity';
import { createFeatureSelector } from '@ngrx/store';
import * as actions from './waypoints.actions';
import { Waypoint } from '../model/waypoint';

export const waypointsAdapter = createEntityAdapter<Waypoint>();
export interface State extends EntityState<Waypoint> {}

const defaultWaypoint = {};
export const initialState: State = waypointsAdapter.getInitialState( defaultWaypoint );

/**
 *
 * @param {State} state
 * @param {WaypointsActions} action
 * @returns {State}
 */
export function waypointsReducer( state: State = initialState,action: actions.WaypointsActions ) {
  switch ( action.type ) {

    case actions.QUERY:
      return state;

    case actions.QUERIED:
      return waypointsAdapter.addAll( action.waypoints,state ); // replace current collection with provided collection

    case actions.CREATE:
      return state;

    case actions.CREATED:
      return waypointsAdapter.addOne( action.waypoint,state );

    case actions.UPDATE:
      return state;

    case actions.UPDATED:
      return waypointsAdapter.updateOne({ id:action.id,changes:action.waypoint },state );

    case actions.IMAGINE:
      return state;

    case actions.IMAGINED:
      return waypointsAdapter.updateOne({ id:action.id,changes:action.waypoint },state );

    case actions.DELETE:
      return state;

    case actions.DELETED:
      return waypointsAdapter.removeOne( action.id,state );

    default:
      return state;
  }
}

export const getWaypointsState = createFeatureSelector<State>('waypoints' );

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = waypointsAdapter.getSelectors( getWaypointsState );
