
import * as AssignmentActions from './assignment.actions';
import { Assignment } from '../model/assignment';

export type Action = AssignmentActions.All;

const defaultAssignmentState: Assignment = {};

export function assignmentReducer( state:Assignment=defaultAssignmentState,action:Action ) {
  switch ( action.type ) {
    case AssignmentActions.ASSIGNMENT_POST:
      return Object.assign({},state,action.assignment ); // builds left-to-right, will take only non-nulls from assignment.action and these will override {} and state
    case AssignmentActions.ASSIGNMENT_FETCH:
      return state;
    case AssignmentActions.ASSIGNMENT_FETCHED:
      return Object.assign({},state,action.assignment ); // builds left-to-right, will take only non-nulls from assignment.action and these will override {} and state
    default:
      return state;
  }
}
