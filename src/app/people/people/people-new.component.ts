
import { Component,OnInit,OnDestroy,ViewEncapsulation,Input,EventEmitter,Output } from '@angular/core';
import * as fromGroup from '../../store/group.reducer';
import * as actions from '../../store/group.actions';
import { AccountState } from '../../app.state';
import { Group } from '../../model/group';
import { isBlank } from '../../util';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-people-new',
  templateUrl: './people-new.component.html',
  styleUrls: ['./people-new.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class PeopleNewComponent implements OnInit,OnDestroy
{
  @Output() finished = new EventEmitter<void>();

  group:Group = { type:'people',category:'persons' };
  validated = false;
  working = false;

  private imagefile?: File = null;
  private ownerid?: string;

  constructor( private accountstore:Store<AccountState>,private groupstore:Store<fromGroup.State> ) {}

  ngOnInit(): void { this.onInit(); }
  doValidation(): boolean { return this.validateFields(); }
  onAdd() { this.add(); }
  onSelectImage( files:File[] ) { this.selectImage( files ); }
  onUnSelectImage() { this.unselectImageFile(); }
  ngOnDestroy(): void { this.onDestroy(); }

  /********************************************************************************************************************/

  private onInit() {
    this.accountstore.select('account' ).take( 1 ).subscribe((account:Account) => {
      this.ownerid = account.id;
    } );
  }

  private validateFields() : boolean {
    this.validated = !isBlank( this.group.name ) && !isBlank( this.group.description ) && (this.imagefile != null);
    return this.validated;
  }

  private add() {
    this.working = true;

    this.groupstore.dispatch( new actions.Create( this.ownerid,this.group,this.imagefile ) );
    setTimeout(() => { this.finished.emit(); },250 );
  }

  private selectImage( files:File[] ) {
    try {
      this.imagefile = files[0];
      this.validateFields();
    } catch ( x ) {
      console.log( x );
    }
  }

  private unselectImageFile() {
    console.log( 'unselectImageFile!' );
    this.imagefile = null;
    this.validateFields();
  }

  private onDestroy() {}
}
