
import { NgModule} from '@angular/core';
import { RouterModule,Routes,CanActivate } from '@angular/router';

import { AuthGuard } from './auth-guard.service';

import { HomeComponent } from './content/home.component';
import { FleetComponent } from './content/fleet.component';
import { RoutesComponent } from './content/routes.component';
import { TimesComponent } from './content/times.component';
import { EventsComponent } from './content/events.component';
import { DevicesComponent } from './content/devices.component';
import { PeopleComponent } from './content/people.component';
import { TrackComponent } from './content/track.component';

import { AccountComponent } from './content/account.component';

import { LoginComponent } from './login.component';
import { PageNotFoundComponent } from './pagenotfound.component';

const routes: Routes = [
  { path:'',redirectTo:'/home',pathMatch:'full' },

  { path:'home',component:HomeComponent },

  { path:'fleet',component:FleetComponent,canActivate:[AuthGuard] },
  { path:'routes',component:RoutesComponent,canActivate:[AuthGuard] },
  { path:'times',component:TimesComponent,canActivate:[AuthGuard] },
  { path:'events',component:EventsComponent,canActivate:[AuthGuard] },
  { path:'devices',component:DevicesComponent,canActivate:[AuthGuard] },
  { path:'people',component:PeopleComponent,canActivate:[AuthGuard] },
  { path:'track',component:TrackComponent,canActivate:[AuthGuard] },

  { path:'account',component:AccountComponent,canActivate:[AuthGuard] },

  { path:'login',component:LoginComponent },
  { path:'**',component:PageNotFoundComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot( routes ) ],
  exports: [ RouterModule ]
})
export class RoutingModule
{
}
