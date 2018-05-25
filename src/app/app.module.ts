
import { NgModule,CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule,HTTP_INTERCEPTORS  } from '@angular/common/http';
import { FormsModule,ReactiveFormsModule,FormBuilder } from '@angular/forms';

import { MatSidenavModule } from '@angular/material';

import {
  ToolbarModule,ButtonModule,BlockUIModule,AccordionModule,SplitButtonModule,SharedModule,DialogModule,TooltipModule,
  MessagesModule,FileUploadModule,RadioButtonModule,PanelModule,DropdownModule,CheckboxModule,ProgressSpinnerModule,
  DataTableModule,CalendarModule,MultiSelectModule,SelectButtonModule,TabViewModule,InputTextareaModule,
  OverlayPanelModule,
  DataListModule,DataGridModule,ConfirmDialogModule,GrowlModule,OrderListModule,InplaceModule,FieldsetModule,
  CarouselModule,
  ChipsModule,TerminalModule,DragDropModule,ToggleButtonModule,SidebarModule,CardModule,EditorModule,GMapModule,
  InputSwitchModule,
  DataScrollerModule,InputTextModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { StepsModule } from 'primeng/steps';

import { ConfirmationService } from 'primeng/api';

import { SecureGuard } from './secure-guard.service';
import { AccountGuard } from './accountguard';
import { LocaleService } from './locale.service';
import { UserService } from './user.service';
import { MapService } from './map.service';
import { API } from './api.service';

import { AppRouteReuseStrategy } from './app.route-reuse-strategy';
import { RouteReuseStrategy,RouterModule } from '@angular/router';

import { APIInterceptor } from './api.interceptor';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { FleetEffects } from './store/fleet-effects.service';
import { RouteEffects } from './store/route-effects.service';
import { WaypointsEffects } from './store/waypoints-effects.service';
import { AssignmentEffects } from './store/assignment-effects.service';
import { TransporterEffects } from './store/transporter-effects.service';
import { FollowsEffects } from './store/follows-effects.service';
import { GroupEffects } from './store/group-effects.serivce';
import { PersonsEffects } from './store/persons-effects.service';

import { fleetReducer } from './store/fleet.reducer';
import { routeReducer } from './store/route.reducer';
import { waypointsReducer } from './store/waypoints.reducer';
import { waypointReducer } from './store/waypoint.reducer';
import { assignmentReducer } from './store/assignment.reducer';
import { transporterReducer } from './store/transporter.reducer';
import { followsReducer } from './store/follows.reducer';
import { groupReducer } from './store/group.reducer';
import { personsReducer } from './store/persons.reducer';

import { routes,RoutingModule } from './routing.module';
import { routerReducer,StoreRouterConnectingModule,RouterStateSerializer } from '@ngrx/router-store';
import { CustomSerializer,RouterEffects } from './store/router.reducer';

import { AppComponent } from './app.component';
import { NavComponent } from './nav.component';
import { BarComponent } from './bar.component';
import { HomeComponent } from './content/home.component';
import { FleetComponent } from './content/fleet/fleet.component';
import { FleetNewComponent } from './content/fleet/fleet-new.component';
import { FleetEditComponent } from './content/fleet/fleet-edit.component';
import { FleetTransportersComponent } from './content/fleet/fleet-transporters.component';
import { FleetTransporterNewComponent } from './content/fleet/fleet-transporter-new.component';
import { FleetTransporterParkComponent } from './content/fleet/fleet-transporter-park.component';
import { RoutesComponent } from './content/routes/routes.component';
import { RouteAssignmentsComponent } from './content/routes/route-assignments.component';
import { RouteEditComponent } from './content/routes/route-edit.component';
import { RouteNewComponent } from './content/routes/route-new.component';
import { RouteAssignmentNewComponent } from './content/routes/route-assignment-new.component';
import { RouteWaypointsComponent } from './content/routes/route-waypoints.component';
import { RouteWaypointNewComponent } from './content/routes/route-waypoint-new.component';
import { RouteWaypointEditComponent } from './content/routes/route-waypoint-edit.component';
import { RouteMapComponent } from './content/routes/route-map.component';
import { PeopleComponent } from './content/people/people.component';
import { GroupEditComponent } from './content/people/group-edit.component';
import { GroupNewComponent } from './content/people/group-new.component';
import { PersonsComponent } from './content/people/persons.component';
import { PersonNewComponent } from './content/people/person-new.component';
import { PersonEditComponent } from './content/people/person-edit.component';
import { FollowComponent } from './content/follow/follow.component';
import { FollowTransportersComponent } from './content/follow/follow-transporters.component';
import { FollowMapComponent } from './content/follow/follow-map.component';
import { FollowEditComponent } from './content/follow/follow-edit.component';
import { SignInComponent } from './sign-in.component';
import { ForbiddenComponent } from './forbidden.component';
import { PageNotFoundComponent } from './pagenotfound.component';
import { UnderConstructionComponent } from './under-construction.component';
import { TestComponent } from './test.component';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';

import { AgmCoreModule } from '@agm/core';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    BarComponent,
    HomeComponent,
    FleetComponent,
    FleetNewComponent,
    FleetEditComponent,
    FleetTransportersComponent,
    FleetTransporterNewComponent,
    FleetTransporterParkComponent,
    RoutesComponent,
    RouteAssignmentsComponent,
    RouteEditComponent,
    RouteNewComponent,
    RouteAssignmentNewComponent,
    RouteWaypointsComponent,
    RouteWaypointNewComponent,
    RouteWaypointEditComponent,
    RouteMapComponent,
    PeopleComponent,
    PersonsComponent,
    PersonNewComponent,
    PersonEditComponent,
    GroupEditComponent,
    GroupNewComponent,
    FollowComponent,
    FollowTransportersComponent,
    FollowMapComponent,
    FollowEditComponent,
    TestComponent,
    SignInComponent,
    ForbiddenComponent,
    PageNotFoundComponent,
    UnderConstructionComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RoutingModule,

    MatSidenavModule,

    ToolbarModule,
    ButtonModule,
    BlockUIModule,
    AccordionModule,
    SplitButtonModule,
    SharedModule,
    DialogModule,
    TooltipModule,
    MessagesModule,
    FileUploadModule,
    RadioButtonModule,
    PanelModule,
    DropdownModule,
    CheckboxModule,
    ProgressSpinnerModule,
    DataTableModule,
    CalendarModule,
    MultiSelectModule,
    SelectButtonModule,
    TabViewModule,
    InputTextareaModule,
    OverlayPanelModule,
    DataListModule,
    DataGridModule,
    ConfirmDialogModule,
    GrowlModule,
    OrderListModule,
    InplaceModule,
    FieldsetModule,
    CarouselModule,
    ChipsModule,
    TerminalModule,
    DragDropModule,
    ToggleButtonModule,
    SidebarModule,
    TableModule,
    StepsModule,
    CardModule,
    EditorModule,
    GMapModule,
    InputSwitchModule,
    ConfirmDialogModule,
    DataScrollerModule,
    InputTextModule,

    AngularFireModule.initializeApp( environment.firebase ),
    AngularFirestoreModule,
    AngularFireStorageModule,

    AgmCoreModule.forRoot({ apiKey:environment.google_api_key } ),

    RouterModule.forRoot( routes ),
    StoreRouterConnectingModule,

    StoreModule.forRoot({
      fleet:fleetReducer,
      route:routeReducer,
      waypoints:waypointsReducer,
      waypoint:waypointReducer,
      persons:personsReducer,
      assignment:assignmentReducer,
      transporter:transporterReducer,
      follows:followsReducer,
      group:groupReducer,
      routerReducer: routerReducer
    } ),


    EffectsModule.forRoot([
      FleetEffects,
      RouteEffects,
      WaypointsEffects,
      AssignmentEffects,
      TransporterEffects,
      FollowsEffects,
      GroupEffects,
      PersonsEffects,
      RouterEffects
    ] ),

    environment.imports
  ],
  providers: [
    { provide:RouteReuseStrategy,useClass:AppRouteReuseStrategy },
    { provide:RouterStateSerializer,useClass:CustomSerializer },

    ConfirmationService,

    SecureGuard,
    AccountGuard,
    LocaleService,
    UserService,
    MapService,
    API,

    // TODO: figure out how to discriminate so that some requests do not result in pre-flight
    // { provide: HTTP_INTERCEPTORS,useClass:APIInterceptor,multi:true }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
