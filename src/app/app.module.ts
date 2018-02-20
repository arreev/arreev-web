
import { NgModule,CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule,HTTP_INTERCEPTORS  } from '@angular/common/http';
import { FormsModule,ReactiveFormsModule,FormBuilder } from '@angular/forms';

import { RoutingModule } from './routing.module';

import { MatSidenavModule } from '@angular/material';

import {
  ToolbarModule,ButtonModule,BlockUIModule,AccordionModule,SplitButtonModule,SharedModule,DialogModule,TooltipModule,
  MessagesModule,FileUploadModule,RadioButtonModule,PanelModule,DropdownModule,CheckboxModule,ProgressSpinnerModule,
  DataTableModule,CalendarModule,MultiSelectModule,SelectButtonModule,TabViewModule,InputTextareaModule,OverlayPanelModule,
  DataListModule,DataGridModule,ConfirmDialogModule,GrowlModule,OrderListModule,InplaceModule,FieldsetModule,CarouselModule,
  ChipsModule,TerminalModule,DragDropModule,ToggleButtonModule,SidebarModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';

import { Authentication } from './authentication.service';
import { AuthGuard } from './auth-guard.service';
import { SharedService } from './shared.service';
import { LocaleService } from './locale.service';
import { UserService } from './user.service';
import { API } from './api.service';

import { AppRouteReuseStrategy } from './app.route-reuse-strategy';
import { RouteReuseStrategy } from '@angular/router';

import { APIInterceptor } from './api.interceptor';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AccountEffects } from './effects.service';

import { accountReducer } from './store/account.reducer';

import { AppComponent } from './app.component';
import { NavComponent } from './nav.component';
import { BarComponent } from './bar.component';
import { HomeComponent } from './content/home.component';
import { FleetComponent } from './content/fleet.component';
import { RoutesComponent } from './content/routes.component';
import { TimesComponent } from './content/times.component';
import { EventsComponent } from './content/events.component';
import { DevicesComponent } from './content/devices.component';
import { PeopleComponent } from './content/people.component';
import { TrackComponent } from './content/track.component';
import { LoginComponent } from './login.component';
import { AccountComponent } from './content/account.component';
import { PageNotFoundComponent } from './pagenotfound.component';
import { TestComponent } from './test.component';

import { environment } from '../environments/environment';
import { StepsModule } from 'primeng/steps';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    BarComponent,
    HomeComponent,
    FleetComponent,
    RoutesComponent,
    TimesComponent,
    EventsComponent,
    DevicesComponent,
    PeopleComponent,
    TrackComponent,
    TestComponent,
    LoginComponent,
    AccountComponent,
    PageNotFoundComponent
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

    StoreModule.forRoot({ account:accountReducer } ),
    EffectsModule.forRoot([ AccountEffects ] ),

    environment.imports
  ],
  providers: [
    { provide:RouteReuseStrategy,useClass:AppRouteReuseStrategy },

    Authentication,
    AuthGuard,
    SharedService,
    LocaleService,
    UserService,
    API,

    // TODO: figure out how to discriminate so that some requests do not result in pre-flight
    // { provide: HTTP_INTERCEPTORS,useClass:APIInterceptor,multi:true }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
