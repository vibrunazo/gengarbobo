import { Component, OnInit } from '@angular/core';
import { Player, Liga } from 'src/app/shared/ligapvp.module';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit {
  player: Player;
  name = '';

  constructor(private route: ActivatedRoute, private router: Router) {

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
  }
}
