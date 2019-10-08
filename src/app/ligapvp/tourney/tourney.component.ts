import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tourney, SuperLiga, TourneyData } from './tourney.module';
import { Liga, Player } from 'src/app/shared/ligapvp.module';
import { AuthService } from 'src/app/services/auth.service';
import { LambidaService } from 'src/app/services/lambida.service';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-tourney',
  templateUrl: './tourney.component.html',
  styleUrls: ['./tourney.component.scss']
})
export class TourneyComponent implements OnInit {
  tourneyId = '';
  tourneyData: TourneyData;
  tourney: Tourney;
  format: string;
  tiers: Player[][] = [];
  selectedGroup = 0;
  editMode = false;
  teamCheck = true;
  showWinrate = false;
  ls;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router,
              private lambida: LambidaService, public dialog: MatDialog) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.id) {
        this.setTourney(params.id);
      }
    });
  }

  setTourney(newId: string) {
    this.tourneyId = newId;
    this.tourneyData = Liga.getTourneyById(newId);
    this.tourney = new Tourney(this.tourneyData);
    // this.sl = new SuperLiga(this.tourneyData);
    // this.tiers.push(this.sl.t1Players);
    // this.tiers.push(this.sl.t2Players);
    // this.tiers.push(this.sl.t3Players);
    // this.tiers.push(this.sl.t4Players);
    // this.tiers.push(this.sl.t5Players);
  }
}
