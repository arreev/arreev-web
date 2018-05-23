
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class MapService
{
  private markers: any[] = [];
  private readonly _markers = new BehaviorSubject<any[]>([]);

  readonly markers$: Observable<any[]> = this._markers.asObservable();

  addMarker( marker:any,map:google.maps.Map ) {
    marker.setMap( map );
    this.markers.push( marker );
    this._markers.next( this.markers );
  }

  getMarkers() : any[] { return this.markers; }

  clearAll() {
    for ( const m of this.markers ) {
      m.setMap( null );
    }
    this.markers = [];
    this._markers.next( this.markers );
  }
}
