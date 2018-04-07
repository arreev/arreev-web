
import {
  Component,OnInit,AfterViewInit,OnDestroy,ViewEncapsulation,Input,Output,EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import * as AssignmentActions from '../store/assignment.actions';
import { AccountState,AssignmentState } from '../app.state';
import { dumpAssignment,Assignment } from '../model/assignment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Transporter } from '../model/transporter';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { API } from '../api.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-routes-assignment-edit',
  templateUrl: './routes-assignment-edit.component.html',
  styleUrls: ['./routes-assignment-edit.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RoutesAssignmentEditComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() id: string;

  @Output() finished = new EventEmitter<boolean>();

  assignment: Assignment = {};
  transporter: Transporter = { name:'...' };

  private readonly _uichange = new BehaviorSubject<void>( null );
  private readonly uichange:Observable<void> = this._uichange.asObservable();
  private uiSubscription: Subscription;

  private assignmentStoreSubscription: Subscription;
  private assignment$: Observable<Assignment>;

  constructor( private assignmentstore:Store<AssignmentState>,private accountstore:Store<AccountState>,
               private api:API,private changedetector:ChangeDetectorRef ) {
    this.assignment$ = this.assignmentstore.select('assignment' );
  }

  ngOnInit(): void {
    this.assignmentStoreSubscription = this.assignment$.skip( 1 ).subscribe(assignment => this.fromAssignmentStore( assignment ) );
    this.assignmentstore.dispatch( new AssignmentActions.AssignmentFetchAction( this.id ) );
  }

  ngAfterViewInit(): void {}

  modelChange() {
    this._uichange.next(null );
  }

  onDone() {
    this.finished.emit(false );
  }

  ngOnDestroy(): void {
    this.unSubscribeUI();
    this.assignmentStoreSubscription.unsubscribe();
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uichange.skip( 1 ).debounceTime( 750 ).subscribe(() => { this.toAssignmentStore(); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription != null ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private toAssignmentStore() {
    console.log( 'RoutesAssignmentEditComponent.toAssignmentStore ' + dumpAssignment( this.assignment ) );

    const assignment = {
      id: this.assignment.id,

      type: this.assignment.type,
      routeid: this.assignment.routeid,
      transporterid: this.assignment.transporterid,
      imageURL: this.assignment.imageURL,
      thumbnailURL: this.assignment.thumbnailURL,

      status: this.assignment.status
    };

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        this.assignmentstore.dispatch( new AssignmentActions.AssignmentPostAction( a.id,assignment ) );
      }
    );
  }

  private fromAssignmentStore( assignment:Assignment ) {
    console.log( 'RoutesAssignmentEditComponent.fromAssignmentStore ' + dumpAssignment( this.assignment ) );

    this.unSubscribeUI();

    this.assignment.id = assignment.id;
    this.assignment.type = assignment.type;
    this.assignment.routeid = assignment.routeid;
    this.assignment.transporterid = assignment.transporterid;
    this.assignment.imageURL = assignment.imageURL;
    this.assignment.thumbnailURL = assignment.thumbnailURL;
    this.assignment.status = assignment.status;

    this.getTransporter( this.assignment.transporterid );

    this.changedetector.detectChanges();
    this.subscribeUI();
  }

  private getTransporter( id:string ) {
    this.api.getTransporter( id ).subscribe(
      t => {
        this.transporter = t;
      }
    );
  }
}

