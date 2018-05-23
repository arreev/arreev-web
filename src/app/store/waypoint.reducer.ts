
import * as WaypointActions from './waypoint.actions';
import { Waypoint } from '../model/waypoint';

export type Action = WaypointActions.All;

export function waypointReducer( state:Waypoint={},action:Action ) {
  switch ( action.type ) {
    case WaypointActions.EDIT:
      return Object.assign({},state,action.waypoint );
    default:
      return state;
  }
}
