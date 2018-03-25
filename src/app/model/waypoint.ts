
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

  status?: string;
}
