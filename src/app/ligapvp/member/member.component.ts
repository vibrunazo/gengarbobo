import { Component, OnInit } from '@angular/core';
import { Player, Liga, Nivel } from 'src/app/shared/ligapvp.module';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit {
  player: Player;
  name = '';
  friends: Player[] = [];
  enemies: Player[] = [];
  dia: Player[] = [];
  rub: Player[] = [];
  saf: Player[] = [];
  colleagues: Player[] = [];
  nonfriends: Player[] = [];

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.id) {
        this.setMember(params.id);
      }
    });

  }

  setMember(member) {
    this.name = member;
    this.player = Liga.getPlayerByName(member);
    this.friends = this.player.getFriends();
    this.enemies = this.player.getEnemies();
    this.enemies = this.enemies.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.dia = this.player.getEnemies(Nivel.Diamante);
    this.dia = this.dia.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.rub = this.player.getEnemies(Nivel.Rubi);
    this.rub = this.rub.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.saf = this.player.getEnemies(Nivel.Safira);
    this.saf = this.saf.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.colleagues = this.player.getColleagues();
    this.colleagues = this.colleagues.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.nonfriends = this.player.getNonFriends();
    this.nonfriends = this.nonfriends.sort((a, b) => b.getWinrate() - a.getWinrate());
  }
}
