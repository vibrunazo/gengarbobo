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
  league = 'great';
  atk = 15;
  def = 15;
  hp = 15;
  result = 'Result will show here.';
  pks: Pokemon[] = [];
  yourrank = 0;
  max = 0;

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
    this.result = `Your rank is ${this.yourrank} of ${this.pks.length}.`;
    this.result += '\nRANK CP   LEVEL    IV        %    STATS   ATK DEF HP';
    const yourpk = this.pks[this.yourrank - 1];
    this.result += '\n';
    this.writePkm(yourpk, this.yourrank);
    this.result += '\n';
    this.pks.forEach((pk, i) => {
      this.writePkm(pk, i + 1);
    });
  }

  writePkm(pk: Pokemon, rank: number) {
    this.result += '\n';
    this.result += (rank + ' ').padStart(5);
    this.result += (pk.cp + '  ').padStart(5);
    this.result += (pk.level + '  ').padStart(6);
    this.result += (pk.iv.atk + '/').padStart(3);
    this.result += (pk.iv.def + '/').padStart(3);
    this.result += (pk.iv.hp + '  ').padStart(4);
    this.result += ((100 * pk.statprod / this.max).toFixed(2) + '%').padStart(7);
    this.result += (Math.round(pk.statprod / 1000) + ' ').padStart(6);
    this.result += (Math.round(pk.stats.atk) + ' ').padStart(6);
    this.result += (Math.round(pk.stats.def) + ' ').padStart(4);
    this.result += (Math.round(pk.stats.hp) + '  ').padStart(5);
  }

  buildList() {
    // let atk = 0; let def = 0; let hp = 0;
    this.pks = [];
    this.max = 0;
    for (let atk = 0; atk < 16; atk++) {
      for (let def = 0; def < 16; def++) {
        for (let hp = 0; hp < 16; hp++) {
          const level = 40;
          this.addPkToList(new Pokemon(this.species, level, atk, def, hp));
        }
      }
    }

    this.pks.sort((a, b) => {
      return b.statprod - a.statprod;
    });

    this.yourrank =
      1 +
      this.pks.findIndex(pk => {
        return (
          pk.iv.atk === this.atk &&
          pk.iv.def === this.def &&
          pk.iv.hp === this.hp
        );
        // return pk.iv === { atk: this.atk, def: this.def, hp: this.hp };
      });
  }

  addPkToList(pokemon: Pokemon) {
    if (this.league !== 'master') {
      const ivs = `${pokemon.iv.atk}/${pokemon.iv.def}/${pokemon.iv.hp}`;
      // if (pokemon.canFightLeague(this.league)) {

      // } else {

      // }
      while (!pokemon.canFightLeague(this.league)) {
        // console.log(`${this.name} ${pokemon.cp} ${ivs} lv${pokemon.level} canNOT fight in ${this.league}.`);
        pokemon.setLevel(pokemon.level - 0.5);
      }
      // console.log(`${this.name} ${pokemon.cp} ${ivs} lv${pokemon.level} can fight in ${this.league}.`);
    }
    this.max = Math.max(this.max, pokemon.statprod);
    this.pks.push(pokemon);
  }
}
