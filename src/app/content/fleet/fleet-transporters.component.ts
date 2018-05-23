
import { AfterViewInit,Component,Input,OnDestroy,OnInit,ViewChild,ViewEncapsulation } from '@angular/core';
import * as TransporterActions from '../../store/transporter.actions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Transporter } from '../../model/transporter';
import { TransporterState } from '../../app.state';
import { AccountGuard } from '../../accountguard';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { API } from '../../api.service';
import { Store } from '@ngrx/store';
import { isBlank } from '../../util';

import * as firebase from 'firebase';

import 'rxjs/add/operator/observeOn';

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
  encapsulation: ViewEncapsulation.Emulated
})
export class FleetTransportersComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() fleetid?: string;
  @Input() refresh: Observable<void>;

  pendingparktransporter?: Transporter = null;
  transporters?: TransporterVM[] = [];
  showfleetparktransporter = false;

  @ViewChild( 'inputFile' ) inputFile; // bit of a dom hack ?

  private refreshSubscription: Subscription;
  private imagetransporterid?: string;

  private readonly _uichange = new BehaviorSubject<void>( null );
  private readonly uichange:Observable<void> = this._uichange.asObservable();
  private uiSubscription: Subscription;

  private transporterSubscription: Subscription;
  private ownerid?: string= null;

  constructor( private api:API,
               private accountguard:AccountGuard,
               private transporterstore:Store<TransporterState>,
               private confirmationService: ConfirmationService ) {}

  ngOnInit(): void {
    this.ownerid = this.accountguard.getOwnerId();

    this.refreshSubscription = this.refresh.subscribe(v => { this.fetch(); } );
    this.transporterSubscription = this.transporterstore.select('transporter' ).skip( 1 ).subscribe( t => { this.fromTransporterStore( t ); } );
    this.fetch();
  }

  ngAfterViewInit(): void {
    this.subscribeUI();
  }

  onEditComplete() {}
  onEditInit() {}

  update( transportervm:TransporterVM ) {
    transportervm.dirty = true;
    this._uichange.next(null );
  }

  pending( transportervm:TransporterVM ) {
    transportervm.dirty = true;
  }

  updatePending() {
    this._uichange.next( null );
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

  onParkTransporter( transporter:Transporter ) {
    this.pendingparktransporter = transporter;
    this.showfleetparktransporter = true;
  }

  onFinishedParkTransporter() {
    this.showfleetparktransporter = false;
    this.pendingparktransporter = null;
  }

  onDeleteTransporter( transporter:Transporter ) {
    const name = transporter.name;
    this.confirmationService.confirm({ header:transporter.name,message:`Are you sure you want to delete ?`,accept: () => { this.deleteTransporter( transporter ); } } );
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
    this.transporterSubscription.unsubscribe();

    this.toTransporterStore();
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uichange.skip( 1 ).debounceTime( 1500 ).subscribe(() => { this.toTransporterStore(); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription != null ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private fetch() {
    const fleetid = this.fleetid;
    this.getTransporters( this.ownerid,fleetid,0,100 );
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
      () => {
        _transporters.sort((a,b) => a.name.localeCompare( b.name ) );
        this.transporters = _transporters;
      }
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

    this.transporterstore.dispatch( new TransporterActions.TransporterPostAction( this.ownerid,transporter ) );
  }

  private fromTransporterStore( transporter:Transporter ) {
    this.unSubscribeUI();
      let n = 0;
      for ( const transportervm of this.transporters ) {
        if ( transportervm.id === transporter.id ) {
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
    const _transporters = this.transporters.filter(t => ( t.id !== id ) );
    this.transporters = _transporters;
    this.transporterstore.dispatch( new TransporterActions.TransporterDeleteAction( this.ownerid,id ) );
  }

  private onError( e ) {
    console.log( e );
  }
}
