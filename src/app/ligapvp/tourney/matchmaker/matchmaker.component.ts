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
  modeEdit = false;
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

  onClearAll() {
    console.log('clear all');
    this.resetLs();
    this.resetTourneyData();
    this.setTourney(this.tourneyId);
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
    // reverses the index because the array was inverted in the view
    this.tourney.delMatch(this.tourney.getMatches().length - index - 1);
    this.saveLs();
  }
  onDelMatchByPlayers(p1: Player, p2: Player) {
    this.tourney.delMatchByPlayers(p1, p2);
    this.saveLs();
  }

  onClickRandom() {
    console.log('random');
    const enemies = this.getEnemies();
    const allowed = enemies.filter(e => this.canAddMatch(e, this.selectedPlayer));
    console.log(allowed);
    const length = allowed.length;
    if (length === 0) { return; }
    const rngPick = getRandomInt(0, length - 1);
    const rngPlayer = allowed[rngPick];
    this.onMatch(rngPlayer);

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

  isSelected(p: Player): boolean {
    return p === this.selectedPlayer;
  }

  canAddMatch(p1: Player, p2: Player): boolean {
    const p1n = p1.getName();
    const p2n = p2.getName();
    if (this.tourney.hasMaxMatches(p1n) || this.tourney.hasMaxMatches(p2n)) { return false; }
    if (this.tourney.hasMatch(p1n, p2n)) { return false; }
    return true;
  }

  getSelectedName(): string {
    if (this.selectedPlayer) { return this.selectedPlayer.getName(); }
    return '';
  }

  getEnemies(): Player[] {
    return this.tourney.getEnemies(this.selectedPlayer);
  }

  getMatchesCount(): number {
    return this.tourney.getMatches().length;
  }

  getMatchesMaxTotal(): number {
    return this.tourney.getMaxMatches();
  }

}
