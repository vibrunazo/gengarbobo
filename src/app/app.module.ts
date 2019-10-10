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
  MatTooltipModule,
  MatCheckboxModule,
  MatSlideToggleModule,
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
import { MembertableComponent } from './ligapvp/membertable/membertable.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { EditDialogComponent } from './ligapvp/member/edit-dialog/edit-dialog.component';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { AdminComponent } from './ligapvp/admin/admin.component';
import { LogsComponent } from './ligapvp/admin/logs/logs.component';
import { TourneyComponent } from './ligapvp/tourney/tourney.component';
import { SltablemakerComponent } from './ligapvp/tourney/sltablemaker/sltablemaker.component';
import { RegisterComponent } from './ligapvp/tourney/register/register.component';
import { MatchmakerComponent } from './ligapvp/tourney/matchmaker/matchmaker.component';

const firebaseConfig = {
  apiKey: 'AIzaSyAyGNDZyvMXGlIX7BxRLyEn8Lujhvs2bXI',
  authDomain: 'gengarbobo.firebaseapp.com',
  databaseURL: 'https://gengarbobo.firebaseio.com',
  projectId: 'gengarbobo',
  storageBucket: 'gengarbobo.appspot.com',
  messagingSenderId: '353076960359',
  appId: '1:353076960359:web:523fe08921d5087927c8c2'
};

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
    MemberComponent,
    MembertableComponent,
    EditDialogComponent,
    AdminComponent,
    LogsComponent,
    TourneyComponent,
    SltablemakerComponent,
    RegisterComponent,
    MatchmakerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(firebaseConfig), // Initialize
    AngularFirestoreModule, // firestore
    AngularFireAuthModule, // auth
    AngularFireStorageModule, // storage
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
    MatTooltipModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSlideToggleModule
  ],
  entryComponents: [
    EditDialogComponent
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyGestureConfig
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
