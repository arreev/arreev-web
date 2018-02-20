
import { Entity } from './entity';

export interface Transporter extends Entity
{
  vin?: string;
  name?: string;
  number?: number;
  description?: string;
  marquee?: string;
  imageURL?: string;
}
