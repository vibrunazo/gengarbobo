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
  tourneyData: TourneyData;
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

    if (!this.tourneyData) {
      this.tourneyData = Liga.getTourneyById(newId);
      this.tourney = new Tourney(this.tourneyData);
      console.log(this.tourneyData);
      console.log(this.tourney);
    }
    this.allPlayers = Liga.getAllPlayers();
    this.allNames = this.allPlayers.map(p => p.getName());
    this.filteredNames = this.allNames;

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

  loadLs() {
    const ls = localStorage.getItem(this.getLsId());
    if (!ls) { return; }
    this.tourneyData = JSON.parse(ls);
    this.tourney = new Tourney(this.tourneyData);
    console.log('loaded this.tourneyData');
    console.log(this.tourneyData);
    console.log(this.tourney);
  }

  onDelPlayer(player: Player) {
    console.log('deleting player ' + player);
    this.tourney.delPlayer(player);
    this.saveLs();
  }

  onAddPlayer(player: Player) {
    console.log('adding player ' + player);
    this.tourney.addToGroup(player.getName(), this.selectedGroup);

  }

  onClickGroup(index: number) {
    this.selectedGroup = index;
  }

  isSelected(index: number): boolean {
   return (this.modeGroups && index === this.selectedGroup);
  }

}
