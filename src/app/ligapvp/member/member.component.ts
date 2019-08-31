import { Component, OnInit } from '@angular/core';
import { Player, Liga } from 'src/app/shared/ligapvp.module';
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
    this.nonfriends = this.player.getNonFriends();
  }
}
