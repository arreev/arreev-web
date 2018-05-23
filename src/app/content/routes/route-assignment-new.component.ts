
import { AfterViewInit,Component,EventEmitter,Input,OnDestroy,OnInit,Output,ViewEncapsulation } from '@angular/core';
import { Transporter } from '../../model/transporter';
import { Assignment } from '../../model/assignment';
import { Fleet } from '../../model/fleet';
import { API } from '../../api.service';

import { activeStateAnimation } from '../../app.animations';

@Component({
  selector: 'app-route-assignment-new',
  templateUrl: './route-assignment-new.component.html',
  styleUrls: ['./route-assignment-new.component.css'],
  animations: [ activeStateAnimation ],
  encapsulation: ViewEncapsulation.Emulated
})
export class RouteAssignmentNewComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() ownerid: string;
  @Input() routeid: string;

  @Output() finished = new EventEmitter<void>();

  fleets: Fleet[] = [];
  transporters: Transporter[] = [];
  selectedfleet?: Fleet = null;
  working = false;

  constructor( private api:API ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngAfterViewInit(): void { this._ngAfterViewInit(); }

  onFleet( fleet:Fleet ) { this._onFleet( fleet ); }
  onTransporter( transporter:Transporter ) { this._onTransporter( transporter ); }

  cardBorder( fleet:Fleet ) { this._cardBorder( fleet ); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.fetchFleets();
  }

  private _ngAfterViewInit(): void {}

  private _onFleet( fleet:Fleet ) {
    if ( this.selectedfleet === fleet ) { return; }

    if ( this.selectedfleet != null ) {
      this.selectedfleet.state = 'inactive';
    }
    this.selectedfleet = fleet;
    this.selectedfleet.state = 'active';

    this.fetchTransporters( fleet );
  }

  /*
   * TODO: server must recognize duplicate Assignment ? (same type,routeid,transporterid)
   */
  private _onTransporter( transporter:Transporter ) {
    if ( this.working ) { return; }

    this.working = true;
    this.transporters = this.transporters.filter((t:Transporter) => (t.id === transporter.id) );

    const partial: Assignment = {
      type: 'route',
      routeid: this.routeid,
      transporterid: transporter.id,
      imageURL: transporter.imageURL
    };
    this.api.postAssignment( this.ownerid,partial ).subscribe(
      (assignment:Assignment) => {},
      (error:Error) => { this.onError( error ); },
      () => {
        this.finished.emit();
        this.working = false;
      }
    );
  }

  private _cardBorder( fleet:Fleet ) {}

  private fetchFleets() {
    const _fleets: Fleet[] = [];
    this.api.getFleets( this.ownerid ).subscribe(
      (fleet:Fleet) => { _fleets.push( fleet ); },
      (error:Error) => { this.onError( error ); },
      () => {
        this.fleets = _fleets;
      }
    );
  }

  private fetchTransporters( fleet:Fleet ) {
    const _transporters: Transporter[] = [];
    this.api.getTransporters( this.ownerid,fleet.id ).subscribe(
      (transporter:Transporter) => { _transporters.push( transporter ); },
      (error:Error) => { this.onError( error ); },
      () => {
        this.transporters = _transporters;
      }
    );
  }

  private onError( error:Error ) {
    console.log( error );
    this.working = false;
  }

  private _ngOnDestroy(): void {}
}
