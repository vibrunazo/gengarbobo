import { Component, OnInit } from '@angular/core';
import { IvComponent } from '../iv.component';
import { LEAGUES } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {

  message = '';
  dad: IvComponent;

  state: State = State.none;
  public State = State;

  ivs = '';
  LEAGUES = LEAGUES;

  constructor() { }

  ngOnInit() {
  }
  writeSummary() {
    const dad = this.dad;
    const ivs = `${dad.atk}/${dad.def}/${dad.hp}`; this.ivs = ivs;
    const r1 = dad.pks[0];
    const r1ivs = `${r1.iv.atk}/${r1.iv.def}/${r1.iv.hp}`;
    const bp = dad.tableItems[0].bp;
    const dealt = bp.split('-')[0];
    const taken = bp.split('-')[1];
    const duel = dad.tableItems[0].duel;

    // let duelwl =  `${bold('WIN')}`;
    // if (duel === 0) { duelwl = `${bold('DRAW')}`; }
    // if (duel < 0) { duelwl = `${bold('LOSE', 'red')}`; }
  }

  setParent(ivComponent: IvComponent) {
    this.dad = ivComponent;
    // this.dad.yourfastmove.name;
  }

  update(newState: State, message?: string) {
    this.message = message;
    if (newState === State.found) {
      this.writeSummary();
    }
    this.state = newState;
  }


  bold(text, c= 'feat'): string {
    return `<span class='${c}'>${text}</span>`;
  }

  nth(d) {
    if (d > 3 && d < 21) { return 'th'; }
    switch (d % 10) {
      case 1:  return 'st';
      case 2:  return 'nd';
      case 3:  return 'rd';
      default: return 'th';
    }
  }


}

export enum State {
  'none',
  'notFound',
  'found'
}
