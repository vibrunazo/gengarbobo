import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Player, Liga, Nivel } from 'src/app/shared/ligapvp.module';
import { ActivatedRoute, Router } from '@angular/router';
import { NetlifyIdentityService } from 'src/app/shared/netlify-identity.service';
import { LambdaService } from 'src/app/shared/lambda.service';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  encapsulation: ViewEncapsulation.None
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
  filter = 'all';

  constructor(private route: ActivatedRoute, private netlifyIdentity: NetlifyIdentityService, private lambdaService: LambdaService) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.id) {
        this.setMember(params.id);
      }
    });

    this.getLambida();
  }

  getLambida() {
    const lresult = this.lambdaService.runTest1().subscribe(data => {
      console.log('data');
      console.log(data);

    });
  }

  changeFilter() {
    this.setMember(this.name);
  }

  setMember(member) {
    this.name = member;
    this.player = Liga.getPlayerByName(member);
    this.friends = this.player.getFriends();
    this.enemies = this.player.getEnemies();
    this.enemies = Liga.filterInscritos(this.enemies, this.filter);
    this.enemies = this.enemies.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.dia = Liga.filterPlayersByTier(this.enemies, Nivel.Diamante);
    this.dia = this.dia.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.rub = Liga.filterPlayersByTier(this.enemies, Nivel.Rubi);
    this.rub = this.rub.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.saf = Liga.filterPlayersByTier(this.enemies, Nivel.Safira);
    this.saf = this.saf.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.colleagues = this.player.getColleagues();
    this.colleagues = Liga.filterInscritos(this.colleagues, this.filter);
    this.colleagues = this.colleagues.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.nonfriends = this.player.getNonFriends();
    this.nonfriends = Liga.filterInscritos(this.nonfriends, this.filter);
    this.nonfriends = this.nonfriends.sort((a, b) => b.getWinrate() - a.getWinrate());
  }
}
