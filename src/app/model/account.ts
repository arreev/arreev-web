
import { Entity } from './entity';

export interface Account extends Entity
{
  firstname?: string;
  lastname?: string;
  email?: string;
  avatarURL?: string;
  role?: string;
  permissions?: string;
  group?: string;
  active?: boolean;
}
