
import {
  Component,OnInit,OnDestroy,ViewEncapsulation,Input,OnChanges,SimpleChanges,Output,
  EventEmitter
} from '@angular/core';
import { Transporter } from '../../model/transporter';
import { listAnimation } from '../../app.animations';
import { API } from '../../api.service';

import { animate,state,style,transition,trigger } from '@angular/animations';

const transporterActiveStateAnimation = trigger('transporter-active-state',[
  state('inactive',style({} ) ),
  state('active',style({} ) ),
] );

@Component({
  selector: 'app-follow-transporters',
  templateUrl: './follow-transporters.component.html',
  styleUrls: ['./follow-transporters.component.css'],
  animations: [ listAnimation,transporterActiveStateAnimation ],
  encapsulation: ViewEncapsulation.Emulated
})
export class FollowTransportersComponent implements OnInit,OnChanges,OnDestroy
{
  @Input() ownerid?: string;
  @Input() fleetid?: string;

  @Output() transporterselection = new EventEmitter<string>();

  transporters: Transporter[] = [];
  selectedtransporter?: Transporter = null;

  constructor( private api:API ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngOnChanges( changes: SimpleChanges ): void { this._ngOnChanges( changes ); }

  onTransporter( transporter:Transporter ) { this._onTransporter( transporter ); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {}

  private _ngOnChanges( changes: SimpleChanges ): void {
    for ( const change in changes ) {
      if ( change === 'fleetid' ) {
        this.fetchTransporters();
      }
    }
  }

  private _onTransporter( transporter:Transporter ) {
    if ( this.selectedtransporter !== null ) {
      this.selectedtransporter.state = 'inactive';
    }
    this.selectedtransporter = transporter;
    this.selectedtransporter.state = 'active';

    this.transporterselection.emit( this.selectedtransporter.id );

    setTimeout(() => { this.selectedtransporter.state = 'inactive'; },500 );
  }

  private fetchTransporters() {
    const _transporters: Transporter[] = [];
    this.api.getTransporters( this.ownerid,this.fleetid ).subscribe(
      (t:Transporter) => { _transporters.push( t ); } ,
      (e:Error) => { this.onError( e ); },
      () => {
        _transporters.sort((a,b) => a.name.localeCompare( b.name ) );
        this.transporters = _transporters;
      }
    );
  }

  private onError( error:Error ) {
    console.log( error );
  }

  private _ngOnDestroy(): void {}
}
