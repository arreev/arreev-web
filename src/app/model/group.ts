
import { Entity } from './entity';

export interface Group extends Entity
{
  ownerid?: string;

  name?: string;
  type?: string;
  category?: string;
  description?: string;
  imageURL?: string;
  thumbnailURL?: string;

  status?: string;

  state?: string; // local usage
}
