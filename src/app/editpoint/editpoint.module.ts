import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditPointPageRoutingModule } from './editpoint-routing.module';
import { EditPointPage } from './editpoint.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditPointPageRoutingModule,
    EditPointPage
  ]
})
export class EditPointPageModule {}
