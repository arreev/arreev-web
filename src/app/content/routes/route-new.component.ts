
import { AfterViewInit,Component,EventEmitter,Input,OnDestroy,OnInit,Output,ViewEncapsulation } from '@angular/core';
import { Route } from '../../model/route';
import { API } from '../../api.service';
import { isBlank } from '../../util';

@Component({
  selector: 'app-route-new',
  templateUrl: './route-new.component.html',
  styleUrls: ['./route-new.component.css'],
  animations: [],
  encapsulation: ViewEncapsulation.Emulated
})
export class RouteNewComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() ownerid:string;

  @Output() finished = new EventEmitter<void>();

  route: Route = {};
  validated = false;
  working = false;

  constructor( private api:API ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngAfterViewInit(): void { this._ngAfterViewInit(); }

  onAdd() { this._onAdd(); }

  validation() { this._validation(); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {}
  private _ngAfterViewInit(): void {}

  private _onAdd() {
    this.working = true;

    const partial:Route = {
      name: this.route.name,
      type: this.route.type,
      category: this.route.category,
      description: this.route.description
    };

    this.api.postRoute( this.ownerid,partial ).subscribe(
      (route:Route) => {},
      (error:Error) => { this.onError( error ); },
      () => {
        this.finished.emit();
        this.working = false;
      }
    );
  }

  private _validation() {
    this.validated =
      !isBlank( this.route.name ) &&
      !isBlank( this.route.type ) &&
      !isBlank( this.route.category ) &&
      !isBlank( this.route.description );
  }

  private onError( error:Error ) {
    console.log( error );
    this.working = false;
  }

  private _ngOnDestroy(): void {}
}

