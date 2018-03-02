
import { Component,OnInit,OnDestroy,ViewEncapsulation,Input,EventEmitter,Output } from '@angular/core';
import { Transporter } from '../model/transporter';
import { Storage } from '@google-cloud/storage';
import { AccountState } from '../app.state';
import { API } from '../api.service';
import { Store } from '@ngrx/store';
import { isBlank } from '../util';

import * as firebase from 'firebase';

class TransporterVM
{
  name?: string;
  description?: string;
  number?: number;
  marquee?: string;
  type?: string;
  category?: string;
}

@Component({
  selector: 'app-fleet-transporter-new',
  templateUrl: './fleet-transporter-new.component.html',
  styleUrls: ['./fleet-transporter-new.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class FleetTransporterNewComponent implements OnInit,OnDestroy
{
  @Input() fleetid: string;
  @Output() finished = new EventEmitter<void>();

  transportervm = { name:'',description:'',number:0,marquee:'',type:'',category:'' };
  validated = false;
  working = false;

  private imagefile?: File = null;

  constructor( private api:API,private accountstore:Store<AccountState> ) {}

  ngOnInit(): void {
    const storageref = firebase.storage().ref();
  }

  validation() {
    let v = false;

    v = !isBlank( this.transportervm.name ) &&
      !isBlank( this.transportervm.description ) &&
      !isBlank( this.transportervm.marquee ) &&
      !isBlank( this.transportervm.type ) &&
      !isBlank( this.transportervm.category ) &&
      ( this.imagefile != null );

    this.validated = v;
  }

  onSelect( e ) {
    try {
      this.imagefile = e[0];
      this.validation();
    } catch ( x ) {
      console.log( x );
    }
  }

  onAdd() {
    this.addNewTransporter();
  }

  ngOnDestroy(): void {
  }

  /*
   * https://firebase.google.com/docs/storage/web/upload-files?authuser=1
   * https://firebase.google.com/docs/storage/security/start?authuser=1
   */
  private addNewTransporter() {
    this.working = true;

    const transporter: Transporter = {
      name: this.transportervm.name,
      description: this.transportervm.description,
      number: this.transportervm.number,
      marquee: this.transportervm.marquee,
      type: this.transportervm.type,
      category: this.transportervm.category
    };

    const fleetid = this.fleetid;
    const file = this.imagefile;

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        /*
         * 1. post to api with transporter.id == null (create)
         */
        const ownerid = a.id;
        this.api.postTransporter( ownerid,fleetid,transporter ).subscribe(
          t => {
            /*
             * 2. upload file to storage, with transporter.id in the name
             */
            const uploadtask = firebase.storage().ref().child( 'transporter/transporter.imageURL.'+t.id ).put( file );
            uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
              (snapshot) => {},
              e => { this.onError( e ); },
              () => {
                /*
                 * 3. set transporter.imageURL,post to api with transporter.id != null (update)
                 */
                t.imageURL = uploadtask.snapshot.downloadURL;
                this.api.postTransporter( ownerid,fleetid,t ).subscribe(
                  ff => {},
                  e => { this.onError( e ); },
                  () => {
                    this.working = false;
                    this.finished.emit();
                  }
                );
              }
            );
          },
          e => { this.onError( e ); },
          () => {}
        );
      }
    );
  }

  private onError( e ) {
    console.log( e );
    this.working = false;
  }
}
