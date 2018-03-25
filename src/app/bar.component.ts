
import { Component,OnInit,AfterViewInit,OnDestroy } from '@angular/core';
import { LocaleService,WeatherUpdate} from './locale.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/interval';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent implements OnInit,OnDestroy,AfterViewInit
{
  private weathersubscription?: Subscription;
  private pingsubscription?: Subscription;

  farenheit = 0;
  celsius = 0;
  conditions = '';
  weathericonurl = '';

  constructor( private localeService:LocaleService ) {}

  ngOnInit(): void {
    // this.weathersubscription = this.localeService.weather.subscribe( wu => { this.weatherUpdate( wu ); } );
    // this.localeService.ping();
    //
    // this.pingsubscription = Observable.interval( 30000 ).subscribe(n => { this.ping(); } );
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    // this.pingsubscription.unsubscribe();
    // this.weathersubscription.unsubscribe();
  }

  private ping() {
    // this.localeService.ping();
  }

  private weatherUpdate( wu?:WeatherUpdate ) {
    this.farenheit = ( wu != null ? wu.farenheiht : 0 );
    this.celsius = ( wu != null ? wu.celsius : 0 );
    this.conditions = ( wu != null ? wu.description : '' );
    this.weathericonurl = ( wu != null ? wu.iconurl : '' );
  }
}
