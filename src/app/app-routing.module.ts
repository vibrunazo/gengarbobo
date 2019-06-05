import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewsComponent } from './news/news.component';
import { AboutComponent } from './about/about.component';
import { DexComponent } from './dex/dex.component';
import { IvComponent } from './iv/iv.component';

const routes: Routes = [
  { path: '', component: NewsComponent },
  { path: 'news', component: NewsComponent },
  { path: 'dex', component: DexComponent },
  { path: 'iv', component: IvComponent },
  { path: 'about', component: AboutComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
