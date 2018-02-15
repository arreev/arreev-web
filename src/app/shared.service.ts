
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

/**
 *
 */
@Injectable()
export class SharedService
{
  private _accountLoading = new BehaviorSubject<boolean>( false );
  private _avatarURL = new BehaviorSubject<string>( 'assets/avatar.png' );

  /**
   *
   * @type {Observable<boolean>}
   */
  readonly accountLoading:Observable<boolean> = this._accountLoading.asObservable();
  /**
   *
   * @type {Observable<string>}
   */
  readonly avatarURL:Observable<string> = this._avatarURL.asObservable();

  /**
   *
   * @param {boolean} on
   */
  setAccountLoading( on:boolean ) { this._accountLoading.next( on ); }

  /**
   *
   * @param {string} url
   */
  setAvatarURL( url?:string ) { this._avatarURL.next( url ); }
}
