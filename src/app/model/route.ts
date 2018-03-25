
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

  status?: string;
}

export function dumpRoute( route:Route ) :string {
  let dump = null;

  if ( route != null ) {
    dump = 'Route<' + route.name + ',' + route.type + ',' + route.category + '>';
  }

  return dump;
}


