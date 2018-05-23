
import { Entity } from './entity';

export interface Person extends Entity
{
  ownerid?: string;
  groupid?: string;

  name?: string;
  type?: string;
  category?: string;
  description?: string;
  imageURL?: string;
  thumbnailURL?: string;

  status?: string;

  state?: string; // local usage
}
