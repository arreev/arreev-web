
import { Entity } from './entity';

export interface User extends Entity
{
  email?: string;
  firstname?: string;
  lastname?: string;
}
