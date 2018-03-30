
import * as WaypointActions from './waypoint.actions';
import { Waypoint } from '../model/waypoint';

export type Action = WaypointActions.All;

const defaultWaypointState: Waypoint = {};

export function waypointReducer( state:Waypoint=defaultWaypointState,action:Action ) {
  switch ( action.type ) {
    case WaypointActions.WAYPOINT_POST:
      return Object.assign({},state,action.waypoint ); // builds left-to-right, will take only non-nulls from waypoint.action and these will override {} and state
    case WaypointActions.WAYPOINT_FETCH:
      return state;
    case WaypointActions.WAYPOINT_FETCHED:
      return Object.assign({},state,action.waypoint ); // builds left-to-right, will take only non-nulls from waypoint.action and these will override {} and state
    default:
      return state;
  }
}
