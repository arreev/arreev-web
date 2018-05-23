
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { environment } from '../environments/environment';
import { AccountGuard } from './accountguard';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

interface APIResponse
{
  status?: any;
  message?: any;
}

@Injectable()
export class APIInterceptor implements HttpInterceptor
{
  constructor( private router:Router,private accountguard:AccountGuard ) {}

  intercept( request:HttpRequest<any>,next:HttpHandler ): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        Authorization: 'TODO',
        'Accept': '*',
        'x-api-key': environment.arreev_api_key
      }
    });

    return next.handle( request )
      .do( (event:HttpEvent<any>) => { this.onResponse( event ); } )
      .catch( response => { this.onError( response ); return Observable.throw( response ); } );
  }

  private onResponse( event ) {
    console.log( event );
    if ( event instanceof HttpResponse ) {
      const httpResponse = event as HttpResponse<any>;
      try {
        const apiResponse = httpResponse.body as APIResponse;
        const apistatus = ( apiResponse.status != null ? apiResponse.status : 0 );
        switch ( apistatus ) {
          case 0:
            break;
        }
      } catch ( x ) {
        console.log( x );
      }
    }
  }

  private onError( response ) {
    if ( response instanceof HttpErrorResponse ) {
      const httpErrorResponse = response as HttpErrorResponse;
      switch ( httpErrorResponse.status ) {
        case 401:
          this.accountguard.signOut();
          break;
      }
    }
  }
}
