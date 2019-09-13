import { Component, OnInit } from '@angular/core';
import { Player, Liga } from '../shared/ligapvp.module';
import { LambidaService } from '../services/lambida.service';

@Component({
  selector: 'app-ligapvp',
  templateUrl: './ligapvp.component.html',
  styleUrls: ['./ligapvp.component.scss']
})
export class LigapvpComponent implements OnInit {

  members: Player[] = [];

  constructor(private lambida: LambidaService) { }

  ngOnInit() {
    // this.updateData();
  }

  async updateData() {
    console.log('before');
    await this.lambida.updateLigaMembers();
    this.members = Liga.getAllPlayers();
    console.log('after');
  }

}
