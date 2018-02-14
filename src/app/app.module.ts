
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

import { UserService } from './user.service';

import { AppComponent } from './app.component';
import { NavComponent } from './nav.component';
import { HomeComponent } from './content/home.component';
import { RoutesComponent } from './content/routes.component';
import { PageNotFoundComponent } from './pagenotfound.component';
import { TestComponent } from './test.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    RoutesComponent,
    TestComponent,
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
    SidebarModule
  ],
  providers: [
    UserService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
