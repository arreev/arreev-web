
import { forEach } from '@angular/router/src/utils/collection';

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

/*
 * returns distance between two latlng objects using haversine formula
 */
export function distanceBetween( p1:google.maps.LatLng,p2:google.maps.LatLng ) : number {
  const R = 6371000; // Radius of the Earth in m
  const dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  const dLon = (p2.lng() - p1.lng()) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2 ) * Math.sin(dLat / 2 ) +
    Math.cos(p1.lat() * Math.PI / 180 ) * Math.cos(p2.lat() * Math.PI / 180 ) * Math.sin(dLon / 2) * Math.sin(dLon / 2 );
  const c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt(1 - a ) );
  const d = R * c;

  return d;
}

/**
 *
 * https://toddmotto.com/angular-decorators
 * https://basarat.gitbooks.io/typescript/docs/javascript/closure.html
 * https://en.wikipedia.org/wiki/Closure_(computer_programming)
 *
 * @param {string} message
 * @returns {(target) => any}
 * @constructor
 */
export function Consoler( message:string = 'Consoler' ) {
  const m = message;

  return function( target ) {
    console.log( m,target.toString() );
  };
}
