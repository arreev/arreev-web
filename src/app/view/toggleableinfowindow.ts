
export class ToggleableInfoWindow extends google.maps.InfoWindow
{
  private _opened = false;

  open( map?:google.maps.Map|google.maps.StreetViewPanorama, anchor?:google.maps.MVCObject ) : void {
    super.open( map,anchor );
    this._opened = true;
  }

  get opened() { return this._opened; }

  close() {
    super.close();
    this._opened = false;
  }
}
