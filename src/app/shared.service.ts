
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

@Injectable()
export class SharedService
{
  private _busy = new BehaviorSubject<boolean>( false );

  readonly busy:Observable<boolean> = this._busy.asObservable();

  setBusy( busy:boolean ) { this._busy.next( busy ); }
}
