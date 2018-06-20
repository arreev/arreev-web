
import { Entity } from './entity';

export interface Follower extends Entity
{
  personid?: string;
  transporterid?: string;
  followable?: boolean;
}
