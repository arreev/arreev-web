
import { Entity } from './entity';

export interface Follow extends Entity
{
  name?: string;

  notifyWhenArrive?: boolean;
  notifyWhenDepart?: boolean;
  notifyWhenDelayed?: boolean;
  subscribeToMessages?: boolean;
  subscribeToWarnings?: boolean;
  transporterid?: string;

  status?: string;
}
