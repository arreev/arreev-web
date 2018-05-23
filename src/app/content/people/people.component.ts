
import { AfterViewInit,ChangeDetectorRef,Component,OnDestroy,OnInit,ViewChild,ViewEncapsulation } from '@angular/core';
import * as groupActions from '../../store/group.actions';
import * as fromGroup from '../../store/group.reducer';
import { PersonsComponent } from './persons.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AccountGuard } from '../../accountguard';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Group } from '../../model/group';
import { API } from '../../api.service';
import { Store } from '@ngrx/store';

import { activeStateAnimation,fadeInAnimation,gridAnimation,scaleInAnimation } from '../../app.animations';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css'],
  animations: [ gridAnimation,scaleInAnimation,fadeInAnimation,activeStateAnimation ],
  encapsulation: ViewEncapsulation.Emulated
})
export class PeopleComponent implements OnInit,AfterViewInit,OnDestroy
{
  groups$: Observable<Group[]> = Observable.from( [] );
  groups: Group[] = [];
  selectedgroup?: Group = null;
  editgroup?: Group = null;
  showgroupnew = false;
  showgrouppersonnew = false;
  working = false;
  editworking = false;

  @ViewChild( PersonsComponent )
  private personsComponent: PersonsComponent;

  private readonly uisubject = new BehaviorSubject<Group>( null );
  private uiSubscription: Subscription;

  private groupSubscription: Subscription;
  private ownerid?: string = null;

  constructor( private api:API,
               private accountguard:AccountGuard,
               private groupstore:Store<fromGroup.State>,
               private changedetector:ChangeDetectorRef,private confirmationService:ConfirmationService ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngAfterViewInit(): void { this._ngAfterViewInit(); }

  onAddGroup() { this._onAddGroup(); }
  onAddPerson() { this._onAddPerson(); }
  onRefresh() { this._onRefresh(); }

  onFinishedGroupNew() { this._onFinishedGroupNew(); }
  onFinishedGroupPersonNew() { this._onFinishedGroupPersonNew(); }

  cardBorder( group:Group ) : string { return this._cardBorder( group ); }

  onGroup( group:Group ) { this._onGroup( group ); }
  onDeleteGroup( group:Group ) { this._onDeleteGroup( group ); }

  onEditWorking( w:boolean ) { this._onEditWorking( w ); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.ownerid = this.accountguard.getOwnerId();

    this.groups$ = this.groupstore.select( fromGroup.selectAll );
    this.groups = [];

    this.groupSubscription = this.groups$.skip( 1 ).subscribe(
      (groups:Group[]) => { this.fromGroupStore( groups ); },
      (error:Error) => { this.onError( error ); },
      () => { this.working = false; }
    );

    this.working = true;
    this.groupstore.dispatch( new groupActions.Query( this.ownerid,'people' ) );
  }

  private _ngAfterViewInit(): void {}

  private _onAddGroup() {
    this.showgroupnew = true;
  }

  private _onAddPerson() {
    this.showgrouppersonnew = true;
  }

  private _onRefresh() {
    this.editgroup = null;
    this.selectedgroup = null;
    this.groups = [];
    this.working = true;
    setTimeout(() => this.groupstore.dispatch( new groupActions.Query( this.ownerid,'people' ) ),100 );
  }

  private _onFinishedGroupNew() {
    this.showgroupnew = false;
    this._onRefresh();
  }

  private _onFinishedGroupPersonNew() {
    this.showgrouppersonnew = false;
    this.personsComponent.refresh();
  }

  private _cardBorder( group:Group ) : string { return( this.selectedgroup === group ? '2px solid #9090C0' : '' ); }

  private _onGroup( group:Group ) {
    if ( this.selectedgroup === group ) {
      return;
    }
    if ( this.selectedgroup != null ) {
      this.selectedgroup.state = 'inactive';
    }
    this.selectedgroup = group;
    this.selectedgroup.state = 'active';

    this.editgroup = null;
    setTimeout(() => { this.editgroup = this.selectedgroup; },100 );
  }

  private _onDeleteGroup( group:Group ) {
    this.confirmationService.confirm({
      header:group.name,
      message:'Are you sure you want to delete ?',
      accept: () => {
        this.working = true;
        this.editgroup = null;
        this.selectedgroup = null;
        this.groups = this.groups.filter(g => (g.id !== group.id) );
        this.groupstore.dispatch( new groupActions.Delete( this.ownerid,group.id ) );
      }
    } );
  }

  private _onEditWorking( w:boolean ) {
    this.editworking = w;
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uisubject.asObservable().skip( 1 ).debounceTime( 1000 ).subscribe((group:Group) => { this.toGroupStore( group ); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription != null ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private toGroupStore( group:Group ) {
  }

  private fromGroupStore( groups:Group[] ) {
    this.unSubscribeUI();
      this.groups = groups;
      this.working = false;
    this.subscribeUI();
  }

  private onError( error:Error ) {
    this.working = false;
    console.log( error );
  }

  private _ngOnDestroy(): void {
    this.unSubscribeUI();
    if ( this.groupSubscription != null ) {
      this.groupSubscription.unsubscribe();
    }
  }
}

