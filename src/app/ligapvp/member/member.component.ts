import { Component, OnInit } from '@angular/core';
import { Player } from 'src/app/shared/ligapvp.module';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit {

  player: Player;

  constructor() { }

  ngOnInit() {
  }

}
