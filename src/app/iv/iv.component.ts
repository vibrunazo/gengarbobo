import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Pokemon } from '../shared/shared.module';
import DEX from '../shared/gamemaster.json';

@Component({
  selector: 'app-iv',
  templateUrl: './iv.component.html',
  styleUrls: ['./iv.component.scss']
})
export class IvComponent implements OnInit {
  name = 'Skarmory';
  league = 'Great';
  att = 15;
  def = 15;
  hp = 15;
  result = 'Result will show here.';
  pks: Pokemon[];

  constructor() {}

  ngOnInit() {}

  onSearch(form: NgForm) {
    if (form.value.name === '') {
      return;
    }
    const pk = Pokemon.searchPkByName(form.value.name);
    if (pk !== undefined) {
      this.result = `Pokémon is: ${pk.speciesName}, it has ${pk.baseStats.atk} attack,
      ${pk.baseStats.def} defense and ${pk.baseStats.hp} hp -- CPM is ${Pokemon.getCPMFromLevel(24.5)}`;
    } else {
      this.result = `Could not find a Pokémon named '${form.value.name}'`;
    }
    //   this.result =
    //     'pokémon is: ' +
    //     form.value.name +
    //     ' with ' +
    //     form.value.att +
    //     '/' +
    //     form.value.def +
    //     '/' +
    //     form.value.hp +
    //     ' IVs.';
  }
}
