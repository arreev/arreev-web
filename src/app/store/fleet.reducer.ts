
import * as FleetActions from './fleet.actions';
import { Fleet } from '../model/fleet';

export type Action = FleetActions.All;

const defaultFleetState: Fleet = {};

export function fleetReducer( state:Fleet=defaultFleetState,action:Action ) {
  switch ( action.type ) {
    case FleetActions.FLEET_POST:
      return Object.assign({},state,action.fleet ); // builds left-to-right, will take only non-nulls from fleet.action and these will override {} and state
    case FleetActions.FLEET_FETCH:
      return state;
    case FleetActions.FLEET_FETCHED:
      return Object.assign({},state,action.fleet ); // builds left-to-right, will take only non-nulls from fleet.action and these will override {} and state
    case FleetActions.FLEET_DELETE:
      return state;
    case FleetActions.FLEET_DELETED:
      return defaultFleetState;
    default:
      return state;
  }
}
