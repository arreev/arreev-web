
import {
  AfterViewInit,ChangeDetectorRef,Component,EventEmitter,Input,OnChanges,OnDestroy,OnInit,Output,SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import * as RouteActions from '../../store/route.actions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { RouteState } from '../../app.state';
import { Route } from '../../model/route';
import { API } from '../../api.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-route-edit',
  templateUrl: './route-edit.component.html',
  styleUrls: ['./route-edit.component.css'],
  animations: [],
  encapsulation: ViewEncapsulation.Emulated
})
/**
 * https://angular.io/guide/component-interaction#component-interaction
 */
export class RouteEditComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() ownerid: string;
  @Input() route: Route;

  private readonly uisubject = new BehaviorSubject<void>( null );
  private uiSubscription: Subscription;

  private routeSubscription?: Subscription;

  constructor( private api:API,private routestore:Store<RouteState>,
               private changedetector:ChangeDetectorRef,private confirmationService:ConfirmationService ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngAfterViewInit(): void { this._ngAfterViewInit(); }

  onModelChange() { this._onModelChange(); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.routeSubscription = this.routestore.select('route' ).skip( 1 ).subscribe((route:Route) => { this.fromRouteStore( route ); } );
  }

  private _ngAfterViewInit(): void {
    this.subscribeUI();
  }

  private _onModelChange() { this.uisubject.next(null ); }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uisubject.asObservable().skip( 1 ).debounceTime( 1000 ).subscribe(() => { this.toRouteStore( this.route ); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private toRouteStore( route:Route ) {
    // console.log( 'RouteEditComponent.toRouteStore ' + route.id );

    const partial:Route = {
      name: route.name,
      type: route.type,
      category: route.category,
      description: route.description
    }
    this.routestore.dispatch( new RouteActions.RoutePostAction( this.ownerid,partial ) );
  }

  private fromRouteStore( route:Route ) {
    // console.log( 'RouteEditComponent.fromRouteStore ' + route.id );

    this.unSubscribeUI();
      this.route.id = route.id;
      this.route.type = route.type;
      this.route.category = route.category;
      this.route.description = route.description;
      this.route.imageURL = route.imageURL;
      this.route.thumbnailURL = route.thumbnailURL;
      this.route.begAddress = route.begAddress;
      this.route.endAddress = route.endAddress;
      this.route.status = route.status;
    this.subscribeUI();
  }

  private onError( error:Error ) {
    console.log( error );
  }

  private _ngOnDestroy(): void {
    this.unSubscribeUI();

    if ( this.routeSubscription != null ) {
      this.routeSubscription.unsubscribe();
    }
  }
}
