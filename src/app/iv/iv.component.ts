import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Pokemon, PokemonSpecies } from '../shared/shared.module';
import DEX from '../shared/gamemaster.json';

@Component({
  selector: 'app-iv',
  templateUrl: './iv.component.html',
  styleUrls: ['./iv.component.scss']
})
export class IvComponent implements OnInit {
  name = 'Skarmory';
  species: PokemonSpecies;
  league = 'master';
  atk = 15;
  def = 15;
  hp = 15;
  result = 'Result will show here.';
  pks: Pokemon[] = [];

  constructor() {}

  ngOnInit() {}

  onSearch(form: NgForm) {
    if (form.value.name === '') {
      return;
    }
    this.species = Pokemon.searchPkByName(form.value.name);
    if (this.species !== undefined) {
      // const pk = new Pokemon(this.species, 40, this.atk, this.def, this.hp);
      // this.result = `Pokémon is: ${this.species.speciesName} level ${pk.level},
      // it has ${pk.stats.atk} attack,
      // ${pk.stats.def} defense and ${pk.stats.hp} hp --
      // Stat product is ${pk.getStatProd()}
      // and CP = ${pk.getCP()}`;

      this.buildList();
      this.writeList();
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

  writeList() {
    this.result = '\nCP      IV      ATK DEF HP      STATS';
    this.pks.forEach(pk => {
      this.result += '\n';
      this.result += pk.getCP() + '  ';
      this.result += pk.iv.atk + '/';
      this.result += pk.iv.def + '/';
      this.result += pk.iv.hp + '  ';
      this.result += Math.round(pk.stats.atk) + '  ';
      this.result += Math.round(pk.stats.def) + '  ';
      this.result += Math.round(pk.stats.hp) + '   ';
      this.result += Math.round(pk.statprod) + '   ';
    });
  }

  buildList() {
    // let atk = 0; let def = 0; let hp = 0;
    this.pks = [];
    for (let atk = 0; atk < 16; atk++) {
      for (let def = 0; def < 16; def++) {
        for (let hp = 0; hp < 16; hp++) {
          this.addPkToList(new Pokemon(this.species, 40, atk, def, hp));
        }
      }
    }

    this.pks.sort((a, b) => {
      return b.statprod - a.statprod;
    });
  }

  addPkToList(pokemon: Pokemon) {
    this.pks.push(pokemon);
  }
}
