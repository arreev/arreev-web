
import { Component,OnInit,OnDestroy,ViewEncapsulation,Input,EventEmitter,Output } from '@angular/core';
import { Transporter } from '../../model/transporter';
import { AccountGuard } from '../../accountguard';
import { Storage } from '@google-cloud/storage';
import { API } from '../../api.service';
import { isBlank } from '../../util';

import * as firebase from 'firebase';

@Component({
  selector: 'app-fleet-transporter-new',
  templateUrl: './fleet-transporter-new.component.html',
  styleUrls: ['./fleet-transporter-new.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class FleetTransporterNewComponent implements OnInit,OnDestroy
{
  @Input() fleetid: string;
  @Output() finished = new EventEmitter<void>();

  transporter = { name:'',description:'',number:0,marquee:'',type:'',category:'' };
  validated = false;
  working = false;

  private imagefile?: File = null;
  private ownerid?: string = null;

  constructor( private api:API,private accountguard:AccountGuard ) {}

  ngOnInit(): void {
    this.ownerid = this.accountguard.getOwnerId();

    const storageref = firebase.storage().ref();
  }

  validation() {
    let v = false;

    v = !isBlank( this.transporter.name ) &&
      !isBlank( this.transporter.description ) &&
      !isBlank( this.transporter.marquee ) &&
      !isBlank( this.transporter.type ) &&
      !isBlank( this.transporter.category ) &&
      ( this.imagefile != null );

    this.validated = v;
  }

  onSelectImage( e ) {
    try {
      this.imagefile = e[0];
      this.validation();
    } catch ( x ) {
      console.log( x );
    }
  }

  onUnSelectImage() {
    this.imagefile = null;
    this.validation();
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
      name: this.transporter.name,
      description: this.transporter.description,
      number: this.transporter.number,
      marquee: this.transporter.marquee,
      type: this.transporter.type,
      category: this.transporter.category
    };

    const fleetid = this.fleetid;
    const file = this.imagefile;

    this.api.postTransporter( this.ownerid,fleetid,transporter ).subscribe(
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
            this.api.postTransporter( this.ownerid,fleetid,t ).subscribe(
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

  private onError( e ) {
    console.log( e );
    this.working = false;
  }
}
