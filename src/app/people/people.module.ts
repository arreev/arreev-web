
import { NgModule,CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule,ReactiveFormsModule,FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  DataGridModule,ToolbarModule,ButtonModule,DialogModule,ProgressSpinnerModule,
  FileUploadModule
} from 'primeng/primeng';

import { PeopleComponent } from './people/people.component';
import { PeopleNewComponent } from './people/people-new.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,

    DataGridModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    ToolbarModule,
    ProgressSpinnerModule,
    FileUploadModule
  ],
  declarations: [
    PeopleComponent,
    PeopleNewComponent
  ],
  exports: [
    PeopleComponent
  ]
})
export class PeopleModule {}
