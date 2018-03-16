
import * as TransporterActions from './transporter.actions';
import { Transporter } from '../model/transporter';

export type Action = TransporterActions.All;

const defaultTransporterState: Transporter = {};

export function transporterReducer( state:Transporter=defaultTransporterState,action:Action ) {
  switch ( action.type ) {
    case TransporterActions.TRANSPORTER_POST:
      return Object.assign({},state,action.transporter ); // builds left-to-right, will take only non-nulls from transporter.action and these will override {} and state
    case TransporterActions.TRANSPORTER_FETCH:
      return state;
    case TransporterActions.TRANSPORTER_FETCHED:
      return Object.assign({},state,action.transporter ); // builds left-to-right, will take only non-nulls from transporter.action and these will override {} and state
    default:
      return state;
  }
}
