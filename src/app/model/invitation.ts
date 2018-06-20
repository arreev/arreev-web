
import { Entity } from './entity';

export interface Invitation extends Entity
{
  ownerid?: string;
  personid?: string;
  status?: string;
}

