
import { AfterViewInit,Component,Input,OnDestroy,OnInit,ViewChild,ViewEncapsulation } from '@angular/core';
import { AccountState,TransporterState } from '../app.state';
import * as AccountActions from '../store/account.actions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Transporter } from '../model/transporter';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { API } from '../api.service';
import { Store } from '@ngrx/store';
import { isBlank } from '../util';

import * as TransporterActions from '../store/transporter.actions';

import * as firebase from 'firebase';

import 'rxjs/add/operator/observeOn';
import { TransporterDeleteAction } from '../store/transporter.actions';


interface TransporterVM extends Transporter
{
  state?: string;
  dirty: boolean;
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

  transporters?: TransporterVM[] = [];

  @ViewChild( 'inputFile' ) inputFile; // bit of a dom hack ?

  private refreshSubscription: Subscription;
  private imagetransporterid?: string;

  private readonly _uichange = new BehaviorSubject<void>( null );
  private readonly uichange:Observable<void> = this._uichange.asObservable();
  private uiSubscription: Subscription;

  private transporterSubscription: Subscription;

  constructor( private api:API,private accountstore:Store<AccountState>,private transporterstore:Store<TransporterState>,
               private confirmationService: ConfirmationService ) {}

  ngOnInit(): void {
    this.refreshSubscription = this.refresh.subscribe(v => { this.fetch(); } );
    this.transporterSubscription = this.transporterstore.select('transporter' ).skip( 1 ).subscribe( t => { this.fromTransporterStore( t ); } );
    this.fetch();
  }

  ngAfterViewInit(): void {
    this.subscribeUI();
  }

  update( transportervm:TransporterVM ) {
    transportervm.dirty = true;
    this._uichange.next(null );
  }

  pending( transportervm:TransporterVM ) {
    transportervm.dirty = true;
  }

  updatePending() {
    this._uichange.next(null );
  }

  onTransporterImage( transporter:Transporter ) {
    this.unSubscribeUI();
    this.imagetransporterid = transporter.id;
    this.inputFile.nativeElement.click(); // bit of a dom hack ?
  }

  onInputFile() {
    try {
      const file = this.inputFile.nativeElement.files[ 0 ];
      this.uploadImage( this.imagetransporterid,file );
    } catch ( x ) {
      console.log( x );
    }
  }

  onDeleteTransporter( transporter:Transporter ) {
    const name = transporter.name;
    this.confirmationService.confirm({ message:`Are you sure you want to delete ${name} ?`,accept: () => { this.deleteTransporter( transporter ); } } );
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
    this.transporterSubscription.unsubscribe();
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uichange.skip( 1 ).debounceTime( 500 ).subscribe(() => { this.toTransporterStore(); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription != null ) {
      this.uiSubscription.unsubscribe();
    }
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
    const _transporters: TransporterVM[] = [];
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
      transportervm.inservice = transporter.inservice;
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

  private toTransporterStore() {
    for ( const tvm of this.transporters ) {
      if ( tvm.dirty ) {
        this.toTransporterStoreForVM( tvm );
      }
      tvm.dirty = false;
    }
  }

  private toTransporterStoreForVM( tvm:TransporterVM ) {
    const transporter = {
      id: tvm.id,
      name: tvm.name,
      number: tvm.number,
      marquee: tvm.marquee,
      diatribe: tvm.diatribe,
      type: tvm.type,
      category: tvm.category,
      description: tvm.description,
      inservice: tvm.inservice,
      imageURL: tvm.imageURL,
      thumbnailURL: tvm.thumbnailURL,
      status: tvm.status
    };

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        this.transporterstore.dispatch( new TransporterActions.TransporterPostAction( a.id,transporter ) );
      }
    );
  }

  private fromTransporterStore( transporter:Transporter ) {
    console.log( 'FleetTransportersComponent.fromTransporterStore ' + transporter );
    this.unSubscribeUI();
      let n = 0;
      for ( const transportervm of this.transporters ) {
        if ( transportervm.id === transporter.id ) {
          // this.assume( transportervm,transporter );
          this.transporters[n] = this.asTransporterVM( transporter );
          break;
        }
        n++;
      }
    this.subscribeUI();
  }

  private uploadImage( transporterid:string,file:File ) {
    const uploadtask = firebase.storage().ref().child( 'transporter/transporter.imageURL.'+transporterid ).put( file );
    uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {},
      e => { this.onError( e ); },
      () => {
        for ( const transportervm of this.transporters ) {
          if ( transportervm.id === transporterid ) {
            transportervm.imageURL = uploadtask.snapshot.downloadURL;
            transportervm.dirty = true;
            this.toTransporterStore();
            break;
          }
        }
      }
    );
  }

  private deleteTransporter( transporter:Transporter ) {
    const id = transporter.id;
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid  = a.id;
        const _transporters = this.transporters.filter( t => ( t.id !== id ) );
        this.transporters = _transporters;
        this.transporterstore.dispatch( new TransporterActions.TransporterDeleteAction( ownerid,id ) );
      }
    );
  }

  private onError( e ) {
    console.log( e );
  }
}
