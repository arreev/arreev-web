
import { AfterViewInit,ChangeDetectorRef,Component,EventEmitter,Input,OnDestroy,OnInit,Output } from '@angular/core';
import * as followsActions from '../../store/follows.actions';
import * as fromFollows from '../../store/follows.reducer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { FollowState } from '../../app.state';
import { Follow } from '../../model/follow';
import { API } from '../../api.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-follow-edit',
  templateUrl: './follow-edit.component.html',
  styleUrls: ['./follow-edit.component.css'],
})
export class FollowEditComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() ownerid: string;
  @Input() fleetid: string;
  @Input() follow: Follow;

  @Output() finished = new EventEmitter<void>();

  ready = false;
  working = false;

  private readonly uisubject = new BehaviorSubject<void>( null );
  private uiSubscription: Subscription;

  private followsSubscription: Subscription;

  constructor( private api:API,
               private followsstore:Store<FollowState>,
               private changedetector:ChangeDetectorRef ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngAfterViewInit(): void { this._ngAfterViewInit(); }
  update() { this._update(); }
  onOK() { this._onOK(); }
  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.uiSubscription = this.uisubject.asObservable().skip( 1 ).debounceTime( 1000 ).subscribe(() => { this.toFollowsStore( this.follow ); } );
  }

  private _ngAfterViewInit(): void {
    setTimeout(() => {
      this.changedetector.detectChanges();
      this.ready = true;
      },100 );
  }

  private _update() {
    this.uisubject.next(null );
  }

  private toFollowsStore( follow:Follow ) {
    if( this.follow.id == null ) {
      this.api.postFollow( this.ownerid,this.fleetid,this.follow ).subscribe(
        (f:Follow) => {
            this.follow = f;
            console.log( 'CREATED FOLLOW ' + this.follow.id );
            this.followsstore.dispatch( new followsActions.Create( this.ownerid,this.fleetid,this.follow ) );
          },
        (e:Error) => { this.onError( e ); }
      );
    } else {
      console.log( 'UPDATE FOLLOW ' + this.follow.id );
      this.followsstore.dispatch( new followsActions.Update( this.ownerid,this.fleetid,this.follow ) );
    }
  }

  private _onOK() {
    this.finished.emit();
  }

  private onError( error:Error ) {
    console.log( error );
  }

  private _ngOnDestroy(): void {
    this.uiSubscription.unsubscribe();
  }
}
