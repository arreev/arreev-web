
import {
  ChangeDetectorRef,Component,Input,OnChanges,OnDestroy,OnInit,SimpleChanges,ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as personsActions from '../../store/persons.actions';
import * as fromPersons from '../../store/persons.reducer';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { Person } from '../../model/person';
import { Store } from '@ngrx/store';

import { gridAnimation } from '../../app.animations';

@Component({
  selector: 'app-group-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.css'],
  animations: [ gridAnimation ],
  encapsulation: ViewEncapsulation.Emulated
})
/**
 *
 */
export class PersonsComponent implements OnInit,OnChanges,OnDestroy
{
  @Input() ownerid: string;
  @Input() groupid: string;

  persons: Person[] = [];
  editperson: Person = null;
  showpersonedit = false;

  private personsSubscription: Subscription;

  constructor( private personsstore:Store<fromPersons.State>,
               private changedetector:ChangeDetectorRef,private confirmationService:ConfirmationService ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngOnChanges( changes: SimpleChanges ): void { this._ngOnChanges( changes ); }

  onPerson( person:Person ) { this._onPerson( person ); }
  onFinishedPersonEdit() { this._onFinishedPersonEdit(); }

  refresh() { this._refresh(); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.persons = [];
    this.editperson = null;

    this.personsSubscription = this.personsstore.select( fromPersons.selectAll ).skip( 1 ).subscribe(
      (persons:Person[]) => { this.fromPersonsStore( persons ); },
      (error:Error) => { this.onError( error ); },
      () => {}
    );

    this.personsstore.dispatch( new personsActions.Query( this.ownerid,this.groupid ) );
  }

  private _ngOnChanges( changes: SimpleChanges ): void {
  }

  private _onPerson( person:Person ) {
    this.editperson = person;
    this.showpersonedit = true;
  }

  private _onFinishedPersonEdit() {
    this.editperson = null;
    this.showpersonedit = false;
    this.personsstore.dispatch( new personsActions.Query( this.ownerid,this.groupid ) );
  }

  private _refresh() {
    this.personsstore.dispatch( new personsActions.Query( this.ownerid,this.groupid ) );
  }

  private fromPersonsStore( persons:Person[] ) {
    persons.sort((a,b) => a.name.localeCompare( b.name ) );
    this.persons = persons;
  }

  private onError( error:Error ) {
    console.log( error );
  }

  private _ngOnDestroy(): void {
    this.personsSubscription.unsubscribe();
  }
}

