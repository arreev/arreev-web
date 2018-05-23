
import { Entity } from './entity';

export interface Fleet extends Entity
{
  ownerid?: string;

  name?: string;
  type?: string;
  category?: string;
  description?: string;
  imageURL?: string;
  thumbnailURL?: string;

  status?: string;

  state?: string; // internal use
}

export function dumpFleet( fleet:Fleet ) :string {
  let dump = null;

  if ( fleet != null ) {
    dump = 'Fleet<' + fleet.name + ',' + fleet.type + ',' + fleet.category + '>';
  }

  return dump;
}


