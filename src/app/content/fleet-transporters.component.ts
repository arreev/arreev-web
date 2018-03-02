
import { AfterViewInit,Component,Input,OnDestroy,OnInit,ViewEncapsulation } from '@angular/core';
import * as AccountActions from '../store/account.actions';
import { Transporter } from '../model/transporter';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { AccountState } from '../app.state';
import { API } from '../api.service';
import { Store } from '@ngrx/store';
import { isBlank } from '../util';

interface TransporterVM extends Transporter
{
  state?: string;
}

@Component({
  selector: 'app-fleet-transporters',
  templateUrl: './fleet-transporters.component.html',
  styleUrls: ['./fleet-transporters.component.css'],
  animations: [],
  encapsulation: ViewEncapsulation.None
})
export class FleetTransportersComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() fleetid?: string;
  @Input() refresh: Observable<void>;

  transporters?: Transporter[] = [];

  private refreshSubscription: Subscription;

  constructor( private api:API,private accountstore:Store<AccountState> ) {}

  ngOnInit(): void {
    this.refreshSubscription = this.refresh.subscribe(v => { this.fetch(); } );
    this.fetch();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
  }

  private fetch() {
    const fleetid = this.fleetid;
    this.accountstore.select( 'account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        if ( !isBlank( a.id ) ) {
          this.getTransporters( ownerid,fleetid,0,100 );
        } else {
          let accountSubscription = null;
          accountSubscription = this.accountstore.select( 'account' ).subscribe(
            aa => { this.getTransporters( ownerid,fleetid,0,100 ); },
            e => { this.onError( e ); accountSubscription.unsubscribe(); },
            () => { accountSubscription.unsubscribe(); }
          );
          this.accountstore.dispatch( new AccountActions.AccountFetchAction() );
        }
      },
      e => { this.onError( e ); },
      () => {}
    );
  }

  /*
   * TODO: support paging
   * TODO: assert account is valid ? (logged in?)
   */
  private getTransporters( ownerid:string,fleetid:string,start:number,count:number ) {
    const _transporters: Transporter[] = [];
    this.api.getTransporters( ownerid,fleetid ).subscribe(
      t => { _transporters.push( this.asTransporterVM( t ) ); },
      e => { this.onError( e ); },
      () => { this.transporters = _transporters; }
    );
  }

  private asTransporterVM( transporter:Transporter ) : TransporterVM {
    let transportervm = null;

    if ( transporter != null ) {
      transportervm = {};
      transportervm.id = transporter.id;
      transportervm.name = transporter.name;
      transportervm.number = transporter.number;
      transportervm.marquee = transporter.marquee;
      transportervm.diatribe = transporter.diatribe;
      transportervm.latitude = transporter.latitude;
      transportervm.longitude = transporter.longitude;
      transportervm.type = transporter.type;
      transportervm.category = transporter.category;
      transportervm.description = transporter.description;
      transportervm.imageURL = transporter.imageURL;
      transportervm.thumbnailURL = transporter.thumbnailURL;
      transportervm.status = transporter.status;
      transportervm.state = 'inactive';
    }

    return transportervm;
  }

  private onError( e ) {
    console.log( e );
  }
}
