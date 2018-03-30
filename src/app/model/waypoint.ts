
import { Entity } from './entity';

export interface Waypoint extends Entity
{
  ownerid?: string;
  routeid?: string;

  name?: string;
  type?: string;
  category?: string;
  description?: string;
  imageURL?: string;
  thumbnailURL?: string;

  address?: string;
  latitude?: number;
  longitude?: number;
  index?: number;

  status?: string;
}

export function dumpWaypoint( waypoint:Waypoint ) :string {
  let dump = null;

  if ( waypoint != null ) {
    dump = 'Waypoint<' + waypoint.name + ',' + waypoint.type + ',' + waypoint.latitude + ',' + waypoint.longitude + '>';
  }

  return dump;
}
