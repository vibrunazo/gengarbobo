import { Component, OnInit, isDevMode, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Pokemon, PokemonSpecies, Move } from '../shared/shared.module';
import { environment } from 'src/environments/environment';
import { TableComponent } from './table/table.component';

@Component({
  selector: 'app-iv',
  templateUrl: './iv.component.html',
  styleUrls: ['./iv.component.scss']
})
export class IvComponent implements OnInit {
  @ViewChild(TableComponent, { static: false }) table: TableComponent;
  name = environment.production ? '' : 'Skarmory';
  // name = '';
  species: PokemonSpecies;
  fastname = '';
  listOfFastMoves: Move[];
  league = 'great';
  miniv = '0';
  atk = 15;
  def = 15;
  hp = 15;
  result = 'Results will show here.';
  pks: Pokemon[] = [];
  yourrank = 0;
  max = 0;
  yourpk: Pokemon;
  yourfastmove: Move;
  pokelist: string[] = [];
  allnames: string[];
  currentName: string;
  tableItems: any[] = [];

  constructor() {}

  ngOnInit() {
    this.pokelist = Pokemon.getFullList();
    this.filterNames(this.name);
  }

  onSearch(form: NgForm) {
    if (form.value.pokename === '') {
      return;
    }
    this.validateForm();
    this.species = Pokemon.searchPkByName(form.value.pokename);
    if (this.species !== undefined) {
      this.buildList();
      this.writeList();
    } else {
      this.result = `Could not find a Pokémon named '${form.value.pokename}'`;
    }

    this.gaSend();
  }

  // makes all form inputs valid
  validateForm() {
    this.atk = this.validateIV(this.atk);
    this.def = this.validateIV(this.def);
    this.hp = this.validateIV(this.hp);
  }

  // takes the value input by the user and makes sure it's a whole number between 0 and 15
  validateIV(value: number): number {
    value = Math.floor(value);
    value = Math.min(value, 15);
    value = Math.max(value, 0);
    return value;
  }

  writeList() {
    this.yourpk = this.pks[this.yourrank - 1];
    const yourpk = this.yourpk;
    this.result = `Your rank is ${this.yourrank} of ${this.pks.length}. `;
    this.result += `Fast Move: ${this.yourfastmove.name}.`;
    this.tableItems = [];
    this.pks.forEach((pk, i) => {
      this.writeRow(pk, i + 1);
    });
    this.table.updateTable(this.tableItems, this.tableItems[this.yourrank - 1], []);
  }

  writeRow(pk: Pokemon, rank: number) {
    const p1dmg = this.yourpk.getDamageToEnemy(this.yourfastmove, pk);
    const p2dmg = pk.getDamageToEnemy(this.yourfastmove, this.yourpk);
    const d = Pokemon.getFmDuel(this.yourpk, this.yourfastmove, pk, this.yourfastmove);
    const row = {
      r: rank,
      cp: pk.cp,
      level: pk.level,
      iv: `${pk.iv.atk}/${pk.iv.def}/${pk.iv.hp}`,
      statprod: Math.round(pk.statprod / 1000),
      pct: ((100 * pk.statprod) / this.max).toFixed(2) + '%',
      bp: `${p1dmg}-${p2dmg}`,
      duel: d,
      atk: pk.stats.atk.toFixed(1),
      def: pk.stats.def.toFixed(1),
      hp: pk.stats.hp
    };
    this.tableItems.push(row);
  }

  writePkm(pk: Pokemon, rank: number) {
    this.result += '\n';
    this.result += (rank + ' ').padStart(5);
    this.result += (pk.cp + '  ').padStart(5);
    this.result += (pk.level + '  ').padStart(6);
    this.result += (pk.iv.atk + '/').padStart(3);
    this.result += (pk.iv.def + '/').padStart(3);
    this.result += (pk.iv.hp + '  ').padStart(4);
    this.result += (((100 * pk.statprod) / this.max).toFixed(2) + '%').padStart(7);
    this.result += (Math.round(pk.statprod / 1000) + ' ').padStart(6);
    this.result += (Math.round(pk.stats.atk) + ' ').padStart(6);
    this.result += (Math.round(pk.stats.def) + ' ').padStart(4);
    this.result += (Math.round(pk.stats.hp) + '  ').padStart(5);
    this.result += (this.yourpk.getDamageToEnemy(this.yourfastmove, pk) + ' - ').padStart(5);
    this.result += (pk.getDamageToEnemy(this.yourfastmove, this.yourpk) + '  ').padStart(3);
  }

  buildList() {
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
        return pk.iv.atk === this.atk && pk.iv.def === this.def && pk.iv.hp === this.hp;
      });
  }

  addPkToList(pokemon: Pokemon) {
    const miniv: number = +this.miniv;
    if (pokemon.iv.atk < miniv || pokemon.iv.def < miniv || pokemon.iv.hp < miniv) {
      return;
    }

    if (this.league !== 'master') {
      while (!pokemon.canFightLeague(this.league)) {
        pokemon.setLevel(pokemon.level - 0.5);
      }
    }
    this.max = Math.max(this.max, pokemon.statprod);
    this.pks.push(pokemon);
  }

  filterNames(val: string) {
    if (val) {
      const filterValue = val.toLowerCase();
      this.species = Pokemon.searchPkByName(val);
      if (this.species !== undefined) {
        this.yourfastmove = Pokemon.getBestMoveBySpecies(this.species);
        this.listOfFastMoves = Pokemon.getFastMoves(this.species);
      }

      return this.pokelist.filter(option => option.toLowerCase().startsWith(filterValue));
    }
    return [];
  }

  getErrorName(): string {
    return 'Pokémon name is required.';
  }
  getErrorIV(): string {
    return 'IVs must be a whole number between 0 and 15.';
  }

  gaSend() {
    if (!environment.production) {
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
