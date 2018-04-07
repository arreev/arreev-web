
import { Component,OnInit,AfterViewInit,OnDestroy,ViewEncapsulation,Input,Output,EventEmitter } from '@angular/core';
import { Transporter } from '../model/transporter';
import { AccountState } from '../app.state';
import { Fleet } from '../model/fleet';
import { Store } from '@ngrx/store';
import { API } from '../api.service';

@Component({
  selector: 'app-routes-assignment-new',
  templateUrl: './routes-assignment-new.component.html',
  styleUrls: ['./routes-assignment-new.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RoutesAssignmentNewComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() routeid: string;

  @Output() finished = new EventEmitter<void>();

  fleets: Fleet[] = [];
  transporters: Transporter[] = [];

  constructor( private api:API,private accountstore:Store<AccountState> ) {}

  ngOnInit(): void {
    this.fetchFleets();
  }

  ngAfterViewInit(): void {}

  onFleet( fleet:Fleet ) {
    this.fetchTransporters( fleet.id );
  }

  onTransporter( transporter:Transporter ) {
    const assignment = {
      type: 'route',
      routeid: this.routeid,
      transporterid: transporter.id,
      imageURL: transporter.imageURL
    };

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        this.api.postAssignment( ownerid,assignment ).subscribe(
          ass => {},
          e => { this.onError( e ); },
          () => { this.finished.emit(); }
        );
      }
    );
  }

  ngOnDestroy(): void {}

  private fetchFleets() {
    const _fleets: Fleet[] = [];
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        this.api.getFleets( ownerid ).subscribe(
          f => { _fleets.push ( f ); },
          e => { this.onError( e ); },
          () => { this.fleets = _fleets; }
        );
      }
    );
  }

  private fetchTransporters( fleetid:string ) {
    const _transporters: Transporter[] = [];
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        this.api.getTransporters( ownerid,fleetid ).subscribe(
          t => { _transporters.push( t ); },
          e => { this.onError( e ); },
          () => { this.transporters = _transporters; }
        );
      }
    );
  }

  private onError( e ) {
    console.log( e );
  }
}

