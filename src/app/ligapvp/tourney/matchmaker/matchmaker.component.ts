import { Component, OnInit } from '@angular/core';
import { Tourney, TourneyGroup } from '../tourney.module';
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
  allowed: Player[];
  enemyCount: number;
  distance = 0;
  rspeed = 5;
  rtimer;
  groupIndex = 0;

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
    const tourneyData = Tourney.getTourneyById(this.tourneyId);
    console.log(tourneyData);
    this.tourney = new Tourney(tourneyData);
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
    const tourneyData = JSON.parse(ls || 'null');
    if (!tourneyData) { return; }
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

  onPauseRandom() {
    clearInterval(this.rtimer);
    this.rtimer = null;
  }

  onRandomAll() {
    console.log('rand all');
    // start from first group
    let groupIndex = 0;
    let currentGroup: TourneyGroup;
    let loops = 0;
    this.rtimer = setInterval(randomNext.bind(this), 100 * (10 - this.rspeed));

    randomNext.bind(this)();

    function randomNext() {
      loops++;
      if (loops > 1000) {
        console.log('took too long, terminating');
        this.onPauseRandom();
      }
      // select one member from that group
      currentGroup = this.tourney.getGroups()[groupIndex];
      const players = currentGroup.players;
      const pname = this.getBestPlayer(players);
      if (!pname) {
        nextGroup.bind(this)(); return;
      }
      this.onAddPlayer(Liga.getPlayerByName(pname));
      // console.log(this.enemyCount);

      if (this.allowed.length === 0) {
        console.log(`no more enemies for ${pname}, terminating`);
        nextGroup.bind(this)(); return;
      }
      // this.selectedPlayer = Liga.getPlayerByName(pname);
      // this.onClickRandom();
      const allowed = this.allowed.map(p => p.getName());
      const bestEnemy = this.getBestPlayer(allowed);
      this.onMatch(Liga.getPlayerByName(bestEnemy));

      // groupIndex++;
    }

    function nextGroup() {
      groupIndex++;
      console.log(`Now on group ${groupIndex}`);
      if (groupIndex >= this.tourney.getGroups().length) {
        console.log(`No more groups, it's all over`);
        this.onPauseRandom();
      }
    }

  }
  getBestPlayer(players: string[]): string {
    // filter only those that has matches left
    players = players.filter(p => this.canFight(p));
    // console.log(`players: ${players}`);
    if (!players) {
      console.log(`no players in this group has any more matches, terminating`);
      return null;
    }
    let result = players[0];
    let best = this.tourney.getMaxMatchesForGroup(this.groupIndex) * 100 + players.length * 1;
    players.forEach(p => {
      const curPlayer = Liga.getPlayerByName(p);
      const cur = this.tourney.getMatchCount(p) * 100 + this.getAllowedEnemies(curPlayer).length * 1;
      // const cur = this.tourney.getMatchCount(p) * 100 + this.tourney.getEnemies(curPlayer).length * 1;
      if (cur < best) {
        best = cur;
        result = p;
      }
    });
    return result;
  }

  onAddPlayer(player: Player) {
    this.selectedPlayer = player;
    this.enemies = this.getEnemies();
    this.enemyCount = this.enemies.length;
    this.allowed = this.enemies.filter(e => this.canAddMatch(e, this.selectedPlayer));
  }

  canFight(pName: string): boolean {
    const player = Liga.getPlayerByName(pName);
    if (this.tourney.hasMaxMatches(pName)) { return false; }
    const enemies = this.tourney.getEnemies(player);
    const allowed = enemies.filter(e => this.canAddMatch(e, player));
    if (allowed.length === 0) { return false; }
    return true;
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
    console.log(this.allowed);
    const length = this.allowed.length;
    if (length === 0) { return; }
    const rngPick = getRandomInt(0, length - 1);
    const rngPlayer = this.allowed[rngPick];
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

  getEnemies(player = this.selectedPlayer): Player[] {
    return this.tourney.getEnemies(player, this.distance);
  }
  getAllowedEnemies(player = this.selectedPlayer): Player[] {
    return this.tourney.getAllowedEnemies(player, this.distance);
  }

  getMatchesCount(): number {
    return this.tourney.getMatches().length;
  }

  getMatchesMaxTotal(): number {
    return this.tourney.getMaxMatches();
  }

  getPlayer(pName: string): Player {
    return Liga.getPlayerByName(pName);
  }

}
