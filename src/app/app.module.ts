import {
  BrowserModule,
  HAMMER_GESTURE_CONFIG
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainnavComponent } from './mainnav/mainnav.component';
import {
  MatSidenavModule,
  MatToolbarModule,
  MatNavList,
  MatIconModule,
  MatButtonModule,
  MatListModule,
  MatCardModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatTooltipModule
} from '@angular/material';
import { NewsComponent } from './news/news.component';
import { DexComponent } from './dex/dex.component';
import { AboutComponent } from './about/about.component';
import { IvComponent } from './iv/iv.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MinValueValidator,
  MaxValueValidator
} from './shared/minmax.directive';
import { TableComponent } from './iv/table/table.component';
import { MyGestureConfig } from './my-gesture-config';
import { FooterComponent } from './footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { PktableComponent } from './dex/pktable/pktable.component';
import { SummaryComponent } from './iv/summary/summary.component';
import { LigapvpComponent } from './ligapvp/ligapvp.component';
import { MemberComponent } from './ligapvp/member/member.component';

@NgModule({
  declarations: [
    AppComponent,
    MainnavComponent,
    NewsComponent,
    DexComponent,
    AboutComponent,
    IvComponent,
    MinValueValidator,
    MaxValueValidator,
    TableComponent,
    FooterComponent,
    PktableComponent,
    SummaryComponent,
    LigapvpComponent,
    MemberComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyGestureConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
