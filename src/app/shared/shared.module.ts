import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import DEX from './gamemaster.json';
import CPM from './cpm.json';

@NgModule({
  declarations: [],
  imports: [CommonModule]
})
export class SharedModule {}

export class PokemonSpecies {
  speciesName: string;
  speciesId: string;
  dex: number;
  baseStats: {
    atk: number;
    def: number;
    hp: number;
  };
  types: string[];
  fastMoves: string[];
  chargedMoves: string[];
  legacyMoves?: string[];
}

export class Pokemon {
  static dex: PokemonSpecies[] = DEX.pokemon;

  species: PokemonSpecies;
  level: number;
  stats = {
    atk: 0, def: 0, hp: 0
  };
  iv = {
    atk: 0, def: 0, hp: 0
  };
  cpm = 0;
  statprod = 0;

  // search a Pokémon by name, return Dex number
  static searchDexByName(name: string): number {
    const r = this.dex.find(p => p.speciesName === name);
    return r.dex;
  }

  // searches a Pokémon by its name, returns a 'Pokemon' object, returns undefined if not found
  static searchPkByName(name: string): PokemonSpecies {
    const r = this.dex.find(
      p => p.speciesName.toLowerCase() === name.toLowerCase()
    );
    return r;
  }

  static getStatProduct(): number {
    return 0;
  }

  static getCPMFromLevel(level: number): number {
    const i = level * 2 - 2;

    return CPM[i].cpm;
  }

  // returns how much Attack stat a pokémon with
  static getAtk(): number {
    return 0;
  }

  constructor(species: PokemonSpecies, level: number, atkiv: number, defiv: number, hpiv: number) {
    this.iv.atk = atkiv;
    this.iv.def = defiv;
    this.iv.hp = hpiv;
    this.level = level;
    this.species = species;
    const cpm = Pokemon.getCPMFromLevel(level);
    this.stats.atk = ((species.baseStats.atk + atkiv) * cpm);
    this.stats.def = ((species.baseStats.def + defiv) * cpm);
    this.stats.hp = ((species.baseStats.hp + hpiv) * cpm);
    this.cpm = cpm;
    this.statprod = this.getStatProd();

  }

  getStatProd(): number {
    return this.stats.atk * this.stats.def * this.stats.hp;
  }

  getCP(): number {
    // CP = (Attack * Defense^0.5 * Stamina^0.5 * CP_Multiplier^2) / 10
    const atk = this.species.baseStats.atk + this.iv.atk;
    const def = this.species.baseStats.def + this.iv.def;
    const hp = this.species.baseStats.hp + this.iv.hp;
    const cpm = this.cpm;
    return Math.floor( (atk * (def ** 0.5) * (hp ** 0.5) * (cpm ** 2) / 10) );
  }

}

// "dex": 3,
//       "speciesName": "Venusaur",
//       "speciesId": "venusaur",
//       "baseStats": {
//         "atk": 198,
//         "def": 189,
//         "hp": 190
//       },
//       "types": [
//         "grass",
//         "poison"
//       ],
//       "fastMoves": [
//         "RAZOR_LEAF",
//         "VINE_WHIP"
//       ],
//       "chargedMoves": [
//         "FRENZY_PLANT",
//         "PETAL_BLIZZARD",
//         "SLUDGE_BOMB",
//         "SOLAR_BEAM"
//       ],
//       "legacyMoves": [
//         "FRENZY_PLANT"
//       ]
