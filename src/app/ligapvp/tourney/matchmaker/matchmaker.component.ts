import { Component, OnInit } from '@angular/core';
import { Tourney } from '../tourney.module';
import { LambidaService } from 'src/app/services/lambida.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Liga, Player } from 'src/app/shared/ligapvp.module';

@Component({
  selector: 'app-matchmaker',
  templateUrl: './matchmaker.component.html',
  styleUrls: ['./matchmaker.component.scss']
})
export class MatchmakerComponent implements OnInit {
  tourneyId = '';
  tourney: Tourney;
  format: string;
  modeEdit = true;
  selectedPlayer: Player;
  enemies: Player[];
  enemyCount: number;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router, private lambida: LambidaService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.id) {
        this.setTourney(params.id);
      }
    });
  }

  setTourney(newId: string) {
    this.tourneyId = newId;
    this.loadLs();
    if (!this.tourney) {
      this.resetTourneyData();
    }
  }

  resetTourneyData() {
    const tourneyData = Liga.getTourneyById(this.tourneyId);
    this.tourney = new Tourney(tourneyData);
    console.log(tourneyData);
    console.log(this.tourney);
  }

  /**
   * The id of the Item saved in Local storage.
   * Will have the format 'tourney-TourneyId'
   */
  getLsId(): string {
    return 'tourney-' + this.tourneyId;
  }

  saveLs() {
    localStorage.setItem(this.getLsId(), JSON.stringify(this.tourney.data));
  }
  resetLs() {
    localStorage.setItem(this.getLsId(), '');
  }

  loadLs() {
    const ls = localStorage.getItem(this.getLsId());
    if (!ls) { return; }
    const tourneyData = JSON.parse(ls);
    this.tourney = new Tourney(tourneyData);
    console.log('loaded this.tourneyData');
    console.log(tourneyData);
    console.log(this.tourney);
  }

  onAddPlayer(player: Player) {
    this.selectedPlayer = player;
    this.enemies = this.getEnemies();
    this.enemyCount = this.enemies.length;
  }

  onMatch(player: Player) {
    console.log(`${this.selectedPlayer} x ${player}`);
    this.tourney.addMatch(this.selectedPlayer.getName(), player.getName());
    this.saveLs();
  }

  onDelMatch(index: number) {
    this.tourney.delMatch(index);
    this.saveLs();
  }

  getSelectedName(): string {
    if (this.selectedPlayer) { return this.selectedPlayer.getName(); }
    return '';
  }

  getEnemies(): Player[] {
    return this.tourney.getEnemies(this.selectedPlayer);
  }

}
