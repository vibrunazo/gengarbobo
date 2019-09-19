import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tourney, SuperLiga } from './tourney.module';
import { Liga, Player } from 'src/app/shared/ligapvp.module';

@Component({
  selector: 'app-tourney',
  templateUrl: './tourney.component.html',
  styleUrls: ['./tourney.component.scss']
})
export class TourneyComponent implements OnInit {
  tourneyId = '';
  tourneyData: Tourney;
  sl: SuperLiga;
  tiers: Player[][] = [];
  selectedGroup = 0;
  teamCheck = true;
  showWinrate = false;
  ls;

  constructor(private route: ActivatedRoute, private router: Router) {}

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

  onClickRandom(tier) {
    const left = tier.filter(p => this.canAddPlayer(p));
    const length = left.length;
    if (length === 0) { return; }
    const rngPick = getRandomInt(0, length - 1);
    const rngPlayer = left[rngPick];
    // console.log(rngPlayer);
    this.sl.addPlayer(rngPlayer, this.selectedGroup, this.teamCheck);
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
