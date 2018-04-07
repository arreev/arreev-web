
import { Entity } from './entity';

export interface Assignment extends Entity
{
  ownerid?: string;

  type?: string;
  routeid?: string;
  transporterid?: string;
  imageURL?: string;
  thumbnailURL?: string;

  status?: string;
}

export function dumpAssignment( assignment:Assignment ) :string {
  let dump = null;

  if ( assignment != null ) {
    dump = 'Assignment<' + assignment.id + ',' + assignment.type + '>';
  }

  return dump;
}
