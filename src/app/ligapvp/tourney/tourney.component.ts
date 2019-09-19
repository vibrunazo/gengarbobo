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

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.id) {
        this.setTourney(params.id);
      }
    });
  }

  isSelected(i): boolean {
    return i === this.selectedGroup;
  }

  onClickGroup(i) {
    this.selectedGroup = i;
  }

  canAddPlayer(p) {
    // return false;
    return this.sl.canAddPlayerToGroup(p, this.selectedGroup);
  }
  onAddPlayer(p) {
    // this.sl.groups[this.selectedGroup].players.push(p);
    this.sl.addPlayer(p, this.selectedGroup);
  }
  onDelPlayer(p) {
    this.sl.delPlayer(p, this.selectedGroup);

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
