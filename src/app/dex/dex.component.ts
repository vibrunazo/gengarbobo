import { Component, OnInit } from '@angular/core';
import DEX from '../shared/gamemaster.json';

interface Pokemon {
  speciesName: string;
}


@Component({
  selector: 'app-dex',
  templateUrl: './dex.component.html',
  styleUrls: ['./dex.component.scss']
})
export class DexComponent implements OnInit {

  pks: Pokemon[] = DEX.pokemon;

  constructor() { }

  ngOnInit() {
  }



}
