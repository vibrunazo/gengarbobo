import { Component, OnInit } from '@angular/core';
import { Tourney, SuperLiga, TourneyData } from '../tourney.module';
import { Player, Liga } from 'src/app/shared/ligapvp.module';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LambidaService } from 'src/app/services/lambida.service';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-sltablemaker',
  templateUrl: './sltablemaker.component.html',
  styleUrls: ['./sltablemaker.component.scss']
})
export class SltablemakerComponent implements OnInit {
  tourneyId = '';
  tourneyData: TourneyData;
  sl: SuperLiga;
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
        this.loadLs();
      }
    });
  }

  saveLs() {
    localStorage.setItem('sl', JSON.stringify(this.sl.groups));
  }

  loadLs() {
    this.ls = localStorage.getItem('sl');
    // this.sl = JSON.parse(this.ls);
    // console.log(JSON.parse(this.ls));
    const groups = JSON.parse(this.ls);
    for (let i = 0; i < 8; i++) {
      const g = groups[i];
      g.players.forEach(p => {
        this.sl.addPlayerByName(p.name, i);
      });
    }
  }

  isSelected(i): boolean {
    return i === this.selectedGroup;
  }

  onClearAll() {
    this.sl.clear();
  }

  onRandomAll() {
    this.sl.clear();
    this.teamCheck = true;
    const inter = setInterval(randomNext.bind(this), 100);
    setTimeout(() => clearInterval(inter), 5000);
    this.selectedGroup = 0;
    let currentTier = 0;
    function randomNext() {
      let tier = this.tiers[currentTier];
      if (this.teamCheck) {
        const left = tier.filter(p => this.canAddPlayer(p));
        const length = left.length;
        if (length === 0) { this.teamCheck = false; }
      }
      this.onClickRandom(tier);
      this.teamCheck = true;
      this.selectedGroup++;
      if (this.selectedGroup > 7) {
        this.selectedGroup = 0;
        currentTier++;
        if (currentTier > 4) {
          // console.log('done? +1 no H');
          clearInterval(inter);
          tier = this.tiers[4];
          this.selectedGroup = 7;
          this.onClickRandom(tier);
          this.teamCheck = true;
        }
      }

    }

  }

  onClickRandom(tier: Player[], teamCheck = this.teamCheck) {
    const left = tier.filter(p => this.canAddPlayer(p));
    const length = left.length;
    if (length === 0) { return; }
    const rngPick = getRandomInt(0, length - 1);
    const rngPlayer = left[rngPick];
    // console.log(rngPlayer);
    this.sl.addPlayer(rngPlayer, this.selectedGroup, teamCheck);
    this.saveLs();

    /**
     * Returns a random integer between min (inclusive) and max (inclusive).
     * The value is no lower than min (or the next integer greater than min
     * if min isn't an integer) and no greater than max (or the next integer
     * lower than max if max isn't an integer).
     * Using Math.round() will give you a non-uniform distribution!
     */
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
  onClickGroup(i) {
    this.selectedGroup = i;
  }

  canAddPlayer(p) {
    // return false;
    return this.sl.canAddPlayerToGroup(p, this.selectedGroup, this.teamCheck);
  }
  onAddPlayer(p) {
    // this.sl.groups[this.selectedGroup].players.push(p);
    this.sl.addPlayer(p, this.selectedGroup, this.teamCheck);
    this.saveLs();
  }
  onDelPlayer(p) {
    this.sl.delPlayer(p, this.selectedGroup);
    this.saveLs();
  }

  setTourney(newId: string) {
    this.tourneyId = newId;
    this.tourneyData = Liga.getTourneyById(newId);
    this.sl = new SuperLiga(this.tourneyData);
    this.tiers.push(this.sl.t1Players);
    this.tiers.push(this.sl.t2Players);
    this.tiers.push(this.sl.t3Players);
    this.tiers.push(this.sl.t4Players);
    this.tiers.push(this.sl.t5Players);
  }

}
