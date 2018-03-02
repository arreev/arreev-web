
import { Entity } from './entity';

export interface Transporter extends Entity
{
  ownerid?: string;

  name?: string;
  type?: string;
  category?: string;
  description?: string;
  imageURL?: string;
  thumbnailURL?: string;

  number?: number;
  marquee?: string;
  latitude?: number;
  longitude?: number;
  diatribe?: string;

  status?: string;
}
