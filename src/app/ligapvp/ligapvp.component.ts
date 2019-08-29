import { Component, OnInit } from '@angular/core';
import { Player, Liga } from '../shared/ligapvp.module';

@Component({
  selector: 'app-ligapvp',
  templateUrl: './ligapvp.component.html',
  styleUrls: ['./ligapvp.component.scss']
})
export class LigapvpComponent implements OnInit {

  members: Player[] = [];

  constructor() { }

  ngOnInit() {
    this.members = Liga.getAllPlayers();
  }

}
