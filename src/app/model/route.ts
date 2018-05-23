
import { Entity } from './entity';

export interface Route extends Entity
{
  ownerid?: string;
  transporterid?: string;

  name?: string;
  type?: string;
  category?: string;
  description?: string;
  imageURL?: string;
  thumbnailURL?: string;

  begAddress?: string;
  endAddress?: string;

  status?: string;

  state?: string; // for internal use
}

export function dumpRoute( route:Route ) :string {
  let dump = null;

  if ( route != null ) {
    dump = 'Route<' + route.name + ',' + route.type + ',' + route.category + ',' + route.begAddress + ',' + route.endAddress + '>';
  }

  return dump;
}


