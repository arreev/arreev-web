
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';

import { environment } from '../environments/environment';

export class WeatherUpdate
{
  farenheiht?: number = null;
  celsius?: number = null;
  description?: string = null;
}

class OWMMain
{
  temp?: number;
  pressure?: number;
  humidity?: number;
  temp_min?: number;
  temp_max?: number;
}

class OWMWeather
{
  base?: string;
  main?: OWMMain;
  visibility?: number;
  dt?: number;
  id?: number;
  name?: string;
  cod?: number;
}

@Injectable()
export class LocaleService
{
  private _weather = new BehaviorSubject<WeatherUpdate>( {} );

  readonly weather: Observable<WeatherUpdate> = this._weather.asObservable();

  constructor( private http:HttpClient ) {}

  ping() {
    const where = 'los%20angeles';
    const url = 'http://api.openweathermap.org/data/2.5/weather?q=' + where + '&APPID=' + environment.openweathermap_apikey;

    this.http.get<OWMWeather>( url ).subscribe(
      owm => {
        const wu = new WeatherUpdate();
        wu.farenheiht = ( owm.main ? Math.round(owm.main.temp * (9 / 5) - 459.67) : null );
        wu.celsius = ( owm.main ? Math.round(owm.main.temp - 273.15) : null );
        this._weather.next( wu );
      }
    );
  }
}
