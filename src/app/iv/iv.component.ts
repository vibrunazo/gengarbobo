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
  summary = 'Results will show here. Calculating all possible wins might take a few seconds.';
  pks: Pokemon[] = [];
  yourrank = 0;
  max = 0;
  yourpk: Pokemon;
  yourfastmove: Move;
  pokelist: string[] = [];
  allnames: string[];
  currentName: string;
  tableItems: any[] = [];
  results: Results[] = [];

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
      this.summary = `Could not find a Pokémon named '${form.value.pokename}'`;
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

  // writes a human readable summary of the data table
  writeSummary() {
    const ivs = `${this.atk}/${this.def}/${this.hp}`;
    const r1 = this.pks[0];
    const r1ivs = `${r1.iv.atk}/${r1.iv.def}/${r1.iv.hp}`;
    const bp = this.tableItems[0].bp;
    const dealt = bp.split('-')[0];
    const taken = bp.split('-')[1];
    const duel = this.tableItems[0].duel;
    let duelwl =  `${bold('WIN')}`;
    if (duel === 0) { duelwl = `${bold('DRAW')}`; }
    if (duel < 0) { duelwl = `${bold('LOSE', 'red')}`; }

    this.summary = `Your ${this.name} with ${bold(ivs)} IV
    has ${bold(this.yourpk.cp)} cp at level ${bold(this.yourpk.level)} for ${(this.league)} league.`;
    this.summary += `<br><br>`;
    this.summary += `It is the ${bold(this.yourrank)}${nth(this.yourrank)} best of ${bold(this.pks.length)} possible combinations,
    when ranked by total Stats Product. `;
    this.summary += `<br><br>`;
    this.summary += `The rank 1 ${this.name} by stat product is ${r1ivs}.<br>
    When dueling against a ${r1ivs} ${this.name},
    your ${bold(this.yourfastmove.name)} deals ${bold(dealt)} damage, and you take ${bold(taken, 'red')} damage.<br>
    Your ${this.name} will ${duelwl} a duel against the rank 1 ${this.name}.<br>
    With the winner ending with ${Math.abs(duel)} health left. If using only fast attacks.`;
    this.summary += `<br><br>`;
    if (this.results.length > 1) {
      const w = this.results[this.yourrank - 1].wins;
      const l = this.results[this.yourrank - 1].losses;
      const s = this.results[this.yourrank - 1].sum;
      const ss = s > 1 ? `${bold(s)}` : `${bold(s, 'red')}`;
      // const wl = w > 1 ? `${bold('WIN')}` : `${bold('LOSE', 'red')}`;
      this.summary += `When using only ${bold(this.yourfastmove.name)}, your ${this.name}
      will ${bold('WIN')} against ${bold(w)}
       other ${this.name}s.<br>`;
      this.summary += `It will ${bold('LOSE', 'red')} against ${bold(l, 'red')}
       other ${this.name}s.<br>`;
      this.summary += `With a ${bold('SUM')} of wins + losses of ${ss}.`;

    } else {
      this.summary += `I'm still calculating fast move battles. This might take a few seconds...`;
    }

    function bold(text, c= 'feat'): string {
      return `<span class='${c}'>${text}</span>`;
    }

    function nth(d) {
      if (d > 3 && d < 21) { return 'th'; }
      switch (d % 10) {
        case 1:  return 'st';
        case 2:  return 'nd';
        case 3:  return 'rd';
        default: return 'th';
      }
    }
  }



  // takes the list this.pks that was built from buildList()
  // and uses it to write another list this.tableItems
  // which is what will end up being sent to the table on the UI
  writeList() {
    this.yourpk = this.pks[this.yourrank - 1];
    const yourpk = this.yourpk;
    // this.result = `Your rank is ${this.yourrank} of ${this.pks.length}. `;
    // this.result += `Fast Move: ${this.yourfastmove.name}.`;
    this.tableItems = [];
    this.pks.forEach((pk, i) => {
      this.writeRow(pk, i + 1);
    });
    this.writeSummary();
    this.table.updateTable(this.tableItems, this.tableItems[this.yourrank - 1], this.name, this.yourfastmove.name);
  }

  writeRow(pk: Pokemon, rank: number) {
    const p1dmg = this.yourpk.getDamageToEnemy(this.yourfastmove, pk);
    const p2dmg = pk.getDamageToEnemy(this.yourfastmove, this.yourpk);
    const d = Pokemon.getFmDuel(this.yourpk, this.yourfastmove, pk, this.yourfastmove);
    const w = this.results.length > 1 ? this.results[rank - 1].wins : '...';
    const l = this.results.length > 1 ? this.results[rank - 1].losses : '...';
    const s = this.results.length > 1 ? this.results[rank - 1].sum : '...';
    const row = {
      r: rank,
      cp: pk.cp,
      level: pk.level,
      iv: `${pk.iv.atk}/${pk.iv.def}/${pk.iv.hp}`,
      statprod: Math.round(pk.statprod / 1000),
      pct: ((100 * pk.statprod) / this.max).toFixed(2) + '%',
      bp: `${p1dmg}-${p2dmg}`,
      duel: d,
      wins: w,
      losses: l,
      sum: s,
      atk: pk.stats.atk.toFixed(1),
      def: pk.stats.def.toFixed(1),
      hp: pk.stats.hp
    };
    this.tableItems.push(row);
  }

  // writePkm(pk: Pokemon, rank: number) {
  //   this.result += '\n';
  //   this.result += (rank + ' ').padStart(5);
  //   this.result += (pk.cp + '  ').padStart(5);
  //   this.result += (pk.level + '  ').padStart(6);
  //   this.result += (pk.iv.atk + '/').padStart(3);
  //   this.result += (pk.iv.def + '/').padStart(3);
  //   this.result += (pk.iv.hp + '  ').padStart(4);
  //   this.result += (((100 * pk.statprod) / this.max).toFixed(2) + '%').padStart(7);
  //   this.result += (Math.round(pk.statprod / 1000) + ' ').padStart(6);
  //   this.result += (Math.round(pk.stats.atk) + ' ').padStart(6);
  //   this.result += (Math.round(pk.stats.def) + ' ').padStart(4);
  //   this.result += (Math.round(pk.stats.hp) + '  ').padStart(5);
  //   this.result += (this.yourpk.getDamageToEnemy(this.yourfastmove, pk) + ' - ').padStart(5);
  //   this.result += (pk.getDamageToEnemy(this.yourfastmove, this.yourpk) + '  ').padStart(3);
  // }

  // adds all pokémon to the list of pokémon on this.pks
  async buildList() {
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

    // console.log(`calculating wins...`);
    // await this.calculateAllWins();
    // window.setTimeout(this.calculateAllWins, 1, this.pks);
    // setTimeout(()=>{
    //   this.calculateAllWins(this.pks);
    // }, 2000);
    this.ww();
    // console.log(`calculated wins.`);
  }

  ww() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.results = [];
      const worker = new Worker('./iv.worker', { type: 'module' });
      worker.onmessage = ({ data }) => {
        // console.log(`page got message: `);
        // console.log(data);
        this.results = data;
        this.writeList();
      };
      const out = {
        pks: this.pks,
        // PK: Pokemon,
        fm: this.yourfastmove

      };
      worker.postMessage(out);
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  // calculateAllWins() {
  //   this.results = [];
  //   for (let i = 0; i < this.pks.length; i++) {
  //     const wins = this.calculateWins(i);
  //     this.results.push(wins);
  //   }
  //   // console.log(`wins: `);
  //   // console.log(this.wins);
  // }

  // calculates how many wins the pokémon with this IV combination has against all other combinations
  calculateWins(index: number): number {
    let wins = 0;
    const p1 = this.pks[index];
    // let p2 = this.pks[0];

    for (const p2 of this.pks) {
      let d = Pokemon.getFmDuel(p1, this.yourfastmove, p2, this.yourfastmove);
      d = Math.min(d, 1);
      d = Math.max(d, -1);
      wins += d;
      // console.log(p2);
    }

    return wins;
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

// Results is a group of wins, losses and their sum. For one pokémon on the table against all other pokémon on the table
// each pokémon row has their own Results
// the final message sent by this worker will be an array of Results, one for each row
interface Results {
  wins: number;
  losses: number;
  sum: number;
}
