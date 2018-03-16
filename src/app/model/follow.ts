
import { Entity } from './entity';

export interface Follow extends Entity
{
  name?: string;

  notifyWhenArrive?: boolean;
  notifyWhenDepart?: boolean;
  notifyWhenDelayed?: boolean;

  subscribeToMessages?: boolean;
  subscribeToWarnings?: boolean;

  status?: string;
}

export function dumpFollow( follow:Follow ) :string {
  let dump = null;

  if ( follow != null ) {
    dump = 'Follow<' + follow.name + ',' + follow.status + '>';
  }

  return dump;
}
