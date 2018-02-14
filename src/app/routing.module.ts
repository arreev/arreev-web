
import { NgModule} from '@angular/core';
import { RouterModule,Routes,CanActivate } from '@angular/router';

import { HomeComponent } from './content/home.component';
import { RoutesComponent } from './content/routes.component';
import { PageNotFoundComponent } from './pagenotfound.component';

const routes: Routes = [
  { path:'',redirectTo:'/home',pathMatch:'full' },

  { path:'home',component:HomeComponent },
  { path:'routes',component:RoutesComponent },

  { path:'**',component:PageNotFoundComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot( routes ) ],
  exports: [ RouterModule ]
})
export class RoutingModule
{
}
