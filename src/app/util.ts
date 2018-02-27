
export function capitalizeFirstLetter( s:string ) : string {
  if ( (s === null) || (s.length < 1) ) { return s; }
  return s[ 0 ].toUpperCase() + s.slice( 1 );
}

export function isEmpty( array:any[] ) : boolean {
  if ( (array != null) && (array.length > 0) ) {
    return false;
  }
  return true;
}

export function isBlank( s:string ) : boolean {
  if ( (s != null) && (s.length > 0) ) {
    return ( s.trim().length === 0 );
  }
  return true;
}
