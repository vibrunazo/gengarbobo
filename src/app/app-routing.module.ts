import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewsComponent } from './news/news.component';
import { AboutComponent } from './about/about.component';
import { DexComponent } from './dex/dex.component';
import { IvComponent } from './iv/iv.component';
import { LigapvpComponent } from './ligapvp/ligapvp.component';
import { MemberComponent } from './ligapvp/member/member.component';
import { AdminComponent } from './ligapvp/admin/admin.component';
import { TourneyComponent } from './ligapvp/tourney/tourney.component';
import { SltablemakerComponent } from './ligapvp/tourney/sltablemaker/sltablemaker.component';

const routes: Routes = [
  { path: '', component: NewsComponent },
  { path: 'news', component: NewsComponent },
  { path: 'dex', component: DexComponent },
  { path: 'iv', component: IvComponent },
  { path: 'about', component: AboutComponent },
  { path: 'liga', component: LigapvpComponent },
  { path: 'liga/m/:id', component: MemberComponent },
  { path: 'liga/t/:id', component: TourneyComponent },
  { path: 'liga/t/:id/slmaker', component: SltablemakerComponent },
  { path: 'liga/admin', component: AdminComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
