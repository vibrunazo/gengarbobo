import { Component, OnInit } from '@angular/core';
import { TourneyData, Tourney } from '../tourney.module';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LambidaService } from 'src/app/services/lambida.service';
import { Liga, Player } from 'src/app/shared/ligapvp.module';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  tourneyId = '';
  tourney: Tourney;
  format: string;
  allPlayers: Player[];
  allNames: string[];
  filteredNames: string[];
  addName: string;
  modeRegister: boolean;
  modeGroups: boolean;
  selectedGroup = 0;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router,
              private lambida: LambidaService) {}

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
    this.allPlayers = Liga.getAllPlayers();
    this.allNames = this.allPlayers.map(p => p.getName());
    this.filteredNames = this.allNames;

  }

  resetTourneyData() {
    const tourneyData = Liga.getTourneyById(this.tourneyId);
    this.tourney = new Tourney(tourneyData);
    console.log(tourneyData);
    console.log(this.tourney);
  }

  filterNames(name: string) {
    this.filteredNames = this.allNames.filter(n => n.toLowerCase().includes(name.toLowerCase()));
  }

  onSubmit() {
    console.log('on submit ' + this.addName);
    const newPlayer = Liga.getPlayerByName(this.addName);
    this.tourney.addPlayer(newPlayer);
    this.saveLs();
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

  onDelPlayer(player: Player) {
    console.log('deleting player ' + player);
    this.tourney.delPlayer(player);
    this.saveLs();
  }

  onDelFromGroup(player: Player) {
    this.tourney.delFromGroup(player.getName(), this.selectedGroup);
    this.saveLs();
  }

  onAddPlayer(player: Player) {
    console.log('adding player ' + player);
    this.tourney.addToGroup(player.getName(), this.selectedGroup);
    this.saveLs();
  }

  onClickGroup(index: number) {
    this.selectedGroup = index;
  }

  onClearAll() {
    console.log('clear all');
    this.resetLs();
    this.resetTourneyData();
    this.setTourney(this.tourneyId);

  }

  isSelected(index: number): boolean {
   return (this.modeGroups && index === this.selectedGroup);
  }

}
