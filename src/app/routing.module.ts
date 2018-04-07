
import { NgModule} from '@angular/core';
import { RouterModule,Routes,CanActivate } from '@angular/router';

import { AuthGuard } from './auth-guard.service';
import { SecureGuard } from './secure-guard.service';

import { HomeComponent } from './content/home.component';
import { FleetComponent } from './content/fleet.component';
import { RoutesComponent } from './content/routes.component';
import { TimesComponent } from './content/times.component';
import { EventsComponent } from './content/events.component';
import { DevicesComponent } from './content/devices.component';
// import { PeopleComponent } from './content/people.component';
import { PeopleComponent } from './people/people/people.component';
import { FollowComponent } from './content/follow.component';
import { UTrackComponent } from './content/utrack.component';

import { AccountComponent } from './content/account.component';
import { LoginComponent } from './login.component';
import { ForbiddenComponent } from './forbidden.component';
import { PageNotFoundComponent } from './pagenotfound.component';
import { UnderConstructionComponent } from './under-construction.component';

const routes: Routes = [
  { path:'',redirectTo:'/home',pathMatch:'full' },

  { path:'home',component:HomeComponent,canActivate:[SecureGuard] },

  { path:'fleet',component:FleetComponent,canActivate:[SecureGuard,AuthGuard] },
  { path:'routes',component:RoutesComponent,canActivate:[SecureGuard,AuthGuard] },
  { path:'times',component:UnderConstructionComponent,canActivate:[SecureGuard,AuthGuard] },
  { path:'events',component:UnderConstructionComponent,canActivate:[SecureGuard,AuthGuard] },
  { path:'people',component:PeopleComponent,canActivate:[SecureGuard,AuthGuard] },
  { path:'follow',component:FollowComponent,canActivate:[SecureGuard,AuthGuard] },
  { path:'utrack',component:UnderConstructionComponent,canActivate:[SecureGuard,AuthGuard] },

  { path:'account',component:AccountComponent,canActivate:[SecureGuard,AuthGuard] },
  { path:'login',component:LoginComponent,canActivate:[SecureGuard] },

  { path:'403',component:ForbiddenComponent },
  { path:'**',component:PageNotFoundComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot( routes ) ],
  exports: [ RouterModule ]
})
export class RoutingModule
{
}
