
import { createEntityAdapter,EntityState } from '@ngrx/entity';
import { createFeatureSelector } from '@ngrx/store';
import * as actions from './persons.actions';
import { Person } from '../model/person';

export const personsAdapter = createEntityAdapter<Person>();
export interface State extends EntityState<Person> {}

const defaultPerson = {};
export const initialState: State = personsAdapter.getInitialState( defaultPerson );

/**
 *
 * @param {State} state
 * @param {PersonsActions} action
 * @returns {State}
 */
export function personsReducer( state: State = initialState,action: actions.PersonsActions ) {
  switch ( action.type ) {

    case actions.QUERY:
      return state;

    case actions.QUERIED:
      return personsAdapter.addAll( action.persons,state ); // replace current collection with provided collection

    case actions.CREATE:
      return state;

    case actions.CREATED:
      return personsAdapter.addOne( action.person,state );

    case actions.UPDATE:
      return state;

    case actions.UPDATED:
      return personsAdapter.updateOne({ id:action.id,changes:action.person },state );

    case actions.IMAGINE:
      return state;

    case actions.IMAGINED:
      return personsAdapter.updateOne({ id:action.id,changes:action.person },state );

    case actions.DELETE:
      return state;

    case actions.DELETED:
      return personsAdapter.removeOne( action.id,state );

    default:
      return state;
  }
}

export const getPersonsState = createFeatureSelector<State>('persons' );

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = personsAdapter.getSelectors( getPersonsState );
