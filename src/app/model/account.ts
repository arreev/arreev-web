
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

export function dumpAccount( account:Account ) : string {
  let dump = null;

  if ( account != null ) {
    dump = 'Account<' + account.firstname + ',' + account.lastname + ',' + account.email + ',' + (account.active ? 'active' : 'inactive') + '>';
  }

  return dump;
}
