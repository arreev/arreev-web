
import {
  AfterViewInit,ChangeDetectorRef,Component,EventEmitter,Input,OnChanges,OnDestroy,OnInit,Output,SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { Assignment } from '../../model/assignment';
import { ConfirmationService } from 'primeng/api';
import { Route } from '../../model/route';
import { API } from '../../api.service';

import { gridAnimation } from '../../app.animations';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-route-assignments',
  templateUrl: './route-assignments.component.html',
  styleUrls: ['./route-assignments.component.css'],
  animations: [ gridAnimation ],
  encapsulation: ViewEncapsulation.Emulated
})
/**
 * https://angular.io/guide/component-interaction#component-interaction
 */
export class RouteAssignmentsComponent implements OnInit,AfterViewInit,OnChanges,OnDestroy
{
  @Input() ownerid: string;
  @Input() route:Route;
  @Input() set refresh( refresh:boolean ) { if ( refresh ) { console.log( 'REFRESH!' ); this.fetchAssignments( this.route ); } }

  @Output() working = new EventEmitter<boolean>();

  assignments: Assignment[] = [];

  constructor( private api:API,private confirmationService:ConfirmationService ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngAfterViewInit(): void { this._ngAfterViewInit(); }
  ngOnChanges( changes:SimpleChanges ): void { this._ngOnChanges( changes ); }

  onAssignment( assignment:Assignment ) { this._onAssignment( assignment ); }
  onRemoveAssignment( assignment:Assignment ) { this._onRemoveAssignment( assignment ); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {}
  private _ngAfterViewInit(): void {}

  private _ngOnChanges( changes:SimpleChanges ): void {
    for ( const change in changes ) {
      if ( change === 'route' ) {
        this.fetchAssignments( this.route );
      }
    }
  }

  private _onAssignment( assignment:Assignment ) {}

  private _onRemoveAssignment( assignment:Assignment ) {
    console.log( 'this._route = ' + this.route );
    this.confirmationService.confirm({ header:assignment.name,message:'Are you sure you wantto delete ?',accept:() => { this.deleteAssignment( assignment ); } } );
  }

  private fetchAssignments( route:Route ) {
    if ( route === null ) {
      this.assignments = [];
      return;
    }

    this.working.emit(true );

    const _assignments: Assignment[] = [];
    this.api.getAssignments( this.ownerid,'route',route.id ).subscribe(
      (assignment:Assignment) => { _assignments.push( assignment ); },
      (error:Error) => { this.onError( error ); },
      () => {
        this.assignments = _assignments;
        this.working.emit(false );
      }
    );
  }

  private deleteAssignment( assignment:Assignment ) {
    this.working.emit(true );

    this.api.deleteAssignment( this.ownerid,assignment.id ).subscribe(
      ( b:boolean ) => {},
      (error:Error) => { this.onError( error ); },
      () => {
        this.fetchAssignments( this.route );
      }
    );
  }

  private onError( error:Error ) {
    this.working.emit(false );
    console.log( error );
  }

  private _ngOnDestroy(): void {}
}
