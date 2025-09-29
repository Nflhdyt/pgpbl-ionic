import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditPointPage } from './editpoint.page';

const routes: Routes = [
  {
    path: '',
    component: EditPointPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditPointPageRoutingModule {}
