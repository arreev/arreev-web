
import * as RouteActions from './route.actions';
import { Route } from '../model/route';

export type Action = RouteActions.All;

const defaultRouteState: Route = {};

export function routeReducer( state:Route=defaultRouteState,action:Action ) {
  switch ( action.type ) {
    case RouteActions.ROUTE_POST:
      return Object.assign({},state,action.route ); // builds left-to-right, will take only non-nulls from route.action and these will override {} and state
    case RouteActions.ROUTE_FETCH:
      return state;
    case RouteActions.ROUTE_FETCHED:
      return Object.assign({},state,action.route ); // builds left-to-right, will take only non-nulls from route.action and these will override {} and state
    case RouteActions.ROUTE_DELETE:
      return state;
    case RouteActions.ROUTE_DELETED:
      return defaultRouteState;
    default:
      return state;
  }
}
