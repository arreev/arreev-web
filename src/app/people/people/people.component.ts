
import { AfterViewInit,ChangeDetectorRef,Component,OnDestroy,OnInit,ViewChild,ViewEncapsulation } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { AccountState } from '../../app.state';
import { Observable } from 'rxjs/Observable';
import { Group } from '../../model/group';
import { Store } from '@ngrx/store';

import * as groupActions from '../../store/group.actions';
import * as fromGroup from '../../store/group.reducer';

import { activeStateAnimation,gridAnimation,scaleInAnimation } from '../../app.animations';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

interface Handler
{
  handle();
}

class Shows
{
  showpeoplenew = false;
}

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css'],
  animations: [ gridAnimation,scaleInAnimation,activeStateAnimation ],
  encapsulation: ViewEncapsulation.None
})
export class PeopleComponent implements OnInit,AfterViewInit,OnDestroy
{
  /*
   * https://github.com/ngrx/platform/tree/master/docs/entity
   * https://angularfirebase.com/lessons/ngrx-entity-feature-modules-tutorial/
   * https://medium.com/ngrx/introducing-ngrx-entity-598176456e15
   */

  @ViewChild( 'inputFile' ) inputFile; // bit of a dom hack ?

  groups$: Observable<Group[]> = Observable.from( [] );
  groups: Group[] = [];
  selectedgroup?: Group = null;
  shows = new Shows();
  working = false;

  private readonly ui = new BehaviorSubject<Group>( null );
  private readonly ui$ = this.ui.asObservable();
  private groupSubscription: Subscription;
  private uiSubscription: Subscription;
  private ownerid?:string;

  constructor( private accountstore:Store<AccountState>,private groupstore:Store<fromGroup.State>,
               private confirmationService:ConfirmationService,
               private changedetector:ChangeDetectorRef ) {}

  ngOnInit(): void { this.onInit(); }
  ngAfterViewInit(): void { this.afterViewInit(); }

  onAddGroup() { new OnAddGroupHandler( this.shows ).handle(); }
  onRefresh() { new OnRefreshHandler().handle(); }
  onGroup( group:Group ) { this.selectGroup( group ); new OnGroupHandler().handle(); }
  onDeleteGroup( group:Group ) { new OnDeleteGroupHandler( this.confirmationService,this.groupstore,this.ownerid,group.id ).handle(); }
  onPeopleNewFinished() { this.selectGroup(null ); new OnPeopleFinishedNewHandler( this.shows ).handle(); }
  onImage() { this.inputFile.nativeElement.click(); }
  onInputFile( group:Group ) { this.working = true; const imagefile = this.inputFile.nativeElement.files[ 0 ]; new OnInputFileHandler( this.groupstore,this.ownerid,group,imagefile ).handle(); }

  cardBorder( group:Group ) { return ( this.selectedgroup === group ? '2px solid #9090C0' : '' ); }
  ngModelChange( group:Group ) { this.ui.next( group ); }

  ngOnDestroy(): void { this.onDestroy(); }

  /*********************************************************************************************************************/

  private onInit() {
    this.groups$ = this.groupstore.select( fromGroup.selectAll );
    this.groups = [];

    this.accountstore.select('account' ).take( 1 ).subscribe((account:Account) => {
      this.ownerid = account.id;
      this.groupSubscription = this.groups$.skip( 1 ).subscribe(
        (groups:Group[]) => { this.fromGroupStore( groups ); },
      );
      this.working = true;
      this.groupstore.dispatch( new groupActions.Query( account.id,'people' ) );
    } );

    this.selectedgroup = null;
  }

  private afterViewInit() {
    this.subscribeUI();
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.ui$.skip( 1 ).debounceTime( 750 ).subscribe((group:Group) => { this.toGroupStore( group ); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription ) { this.uiSubscription.unsubscribe(); }
  }

  private selectGroup( group?:Group ) {
    if ( this.selectedgroup === group ) { return; }
    if ( this.selectedgroup ) {
      this.selectedgroup.state = 'inactive';
      this.selectedgroup = null;
    }
    setTimeout(() => {
      this.selectedgroup = group;
      if ( this.selectedgroup != null ) {
        this.selectedgroup.state = 'active';
      }
    },100 );
  }

  private toGroupStore( group:Group ) {
    console.log( 'toGroupStore ' + group.id+'<'+group.name+'>' );
    const g:Group = {
      /*
       * set id will affect an update ... all the following fields are required by the server
       */
      id: group.id,
      name: group.name,
      type: group.type,
      description: group.description,
      category: group.category
    };
    this.groupstore.dispatch( new groupActions.Update( this.ownerid,group.id,g ) );
  }

  private fromGroupStore( groups:Group[] ) {
    let s = '';
    groups.forEach(g => { s += g.id+'<'+g.name+'> '; } );
    console.log( 'fromGroupStore ' + s );
    this.unSubscribeUI();
      this.groups = groups;
      this.working = false;
    this.subscribeUI();
  }

  private onDestroy() {
    this.unSubscribeUI();
    this.groupSubscription.unsubscribe();
  }
}

class OnAddGroupHandler implements Handler
{
  constructor( private shows:Shows ) {}

  handle() {
    this.shows.showpeoplenew = true;
  }
}

class OnRefreshHandler implements Handler
{
  handle() {}
}

class OnGroupHandler implements Handler
{
  handle() {}
}

class OnDeleteGroupHandler implements Handler
{
  constructor( private confirmationService:ConfirmationService,private groupstore:Store<fromGroup.State>,private ownerid:string,private id:string ) {}

  handle() {
    this.confirmationService.confirm({ message:`Are you sure you want to delete ${name} ?`,accept: () => {
      this.groupstore.dispatch( new groupActions.Delete( this.ownerid,this.id ) );
    } } );
  }
}

class OnPeopleFinishedNewHandler implements Handler
{
  constructor( private shows:Shows ) {}

  handle() {
    this.shows.showpeoplenew = false;
  }
}

class OnInputFileHandler implements Handler
{
  constructor( private groupstore:Store<fromGroup.State>,private ownerid:string,private group:Group,private imagefile:File ) {}

  handle() {
    const g:Group = {
      /*
       * set id will affect an update ... all the following fields are required by the server
       */
      id: this.group.id,
      name: this.group.name,
      type: this.group.type,
      description: this.group.description,
      category: this.group.category
    };
    this.groupstore.dispatch( new groupActions.Imagine( this.ownerid,this.group.id,g,this.imagefile ) );
  }
}
