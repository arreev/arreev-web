
import { NgModule} from '@angular/core';
import { RouterModule,Routes,CanActivate } from '@angular/router';

import { SecureGuard } from './secure-guard.service';
import { AccountGuard } from './accountguard';

import { HomeComponent } from './content/home.component';
import { FleetComponent } from './content/fleet/fleet.component';
import { RoutesComponent } from './content/routes/routes.component';
import { PeopleComponent } from './content/people/people.component';
import { FollowComponent } from './content/follow/follow.component';
import { SignInComponent } from './sign-in.component';
import { ForbiddenComponent } from './forbidden.component';
import { PageNotFoundComponent } from './pagenotfound.component';
import { UnderConstructionComponent } from './under-construction.component';

export const routes: Routes = [
  { path:'',redirectTo:'/home',pathMatch:'full' },

  { path:'home',component:HomeComponent,canActivate:[SecureGuard] },

  { path:'fleet',component:FleetComponent,canActivate:[SecureGuard,AccountGuard] },
  { path:'routes',component:RoutesComponent,canActivate:[SecureGuard,AccountGuard] },
  { path:'times',component:UnderConstructionComponent,canActivate:[SecureGuard,AccountGuard] },
  { path:'events',component:UnderConstructionComponent,canActivate:[SecureGuard,AccountGuard] },
  { path:'people',component:PeopleComponent,canActivate:[SecureGuard,AccountGuard] },
  { path:'follow',component:FollowComponent,canActivate:[SecureGuard,AccountGuard] },
  { path:'utrack',component:UnderConstructionComponent,canActivate:[SecureGuard,AccountGuard] },

  { path:'sign-in',component:SignInComponent,canActivate:[SecureGuard] },

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
