import { Component, OnInit, isDevMode } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Pokemon, PokemonSpecies, Move } from '../shared/shared.module';

@Component({
  selector: 'app-iv',
  templateUrl: './iv.component.html',
  styleUrls: ['./iv.component.scss']
})
export class IvComponent implements OnInit {
  name = isDevMode ? 'Skarmory' : '';
  species: PokemonSpecies;
  league = 'great';
  atk = 15;
  def = 15;
  hp = 15;
  result = 'Results will show here.';
  pks: Pokemon[] = [];
  yourrank = 0;
  max = 0;
  yourpk: Pokemon;
  yourfastmove: Move;

  constructor() {}

  ngOnInit() {}

  onSearch(form: NgForm) {
    if (form.value.name === '') {
      return;
    }
    this.species = Pokemon.searchPkByName(form.value.name);
    if (this.species !== undefined) {

      this.buildList();
      this.writeList();
    } else {
      this.result = `Could not find a Pokémon named '${form.value.name}'`;
    }

    this.gaSend();
  }

  writeList() {
    this.yourpk = this.pks[this.yourrank - 1];
    const yourpk = this.yourpk;
    this.yourfastmove = yourpk.getBestFastMove();
    this.result = `Your rank is ${this.yourrank} of ${this.pks.length}.`;
    this.result += `\nFast Move ${this.yourfastmove.name}.`;
    this.result += '\nRANK CP   LEVEL    IV        %    STATS   ATK DEF HP    Breakpoints';
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
    this.result += (((100 * pk.statprod) / this.max).toFixed(2) + '%').padStart(
      7
    );
    this.result += (Math.round(pk.statprod / 1000) + ' ').padStart(6);
    this.result += (Math.round(pk.stats.atk) + ' ').padStart(6);
    this.result += (Math.round(pk.stats.def) + ' ').padStart(4);
    // this.result += ((pk.stats.atk) + ' ').padStart(6);
    // this.result += ((pk.stats.def) + ' ').padStart(4);
    this.result += (Math.round(pk.stats.hp) + '  ').padStart(5);
    this.result += (this.yourpk.getDamageToEnemy(this.yourfastmove, pk) + ' - ').padStart(5);
    this.result += (pk.getDamageToEnemy(this.yourfastmove, this.yourpk) + '  ').padStart(3);
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

  gaSend() {
    if (isDevMode()) {
      return;
    }

    // Send the event to the Google Analytics property
    // with tracking ID GA_TRACKING_ID.
    // (<any>window).gtag('config', 'UA-122077579-2', {'page_path': event.urlAfterRedirects});
    (window as any).gtag('event', 'search', {
      send_to: 'UA-122077579-2',
      event_category: 'Iv',
      event_action: `Pk: ${this.name} l: ${this.league} iv: ${this.atk}/${this.def}/${this.hp}`,
      event_value: 'iv',
      event_label: 'iv'
    });
  }
}
