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
  atk = 15;
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
    const species = Pokemon.searchPkByName(form.value.name);
    if (species !== undefined) {
      const pk = new Pokemon(species, 40, this.atk, this.def, this.hp);
      this.result = `Pokémon is: ${species.speciesName} level ${pk.level}, it has ${pk.stats.atk} attack,
      ${pk.stats.def} defense and ${pk.stats.hp} hp -- Stat product is ${pk.getStatProd()}
      and CP = ${pk.getCP()}`;
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
