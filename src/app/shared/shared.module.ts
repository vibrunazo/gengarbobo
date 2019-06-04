import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import DEX from './gamemaster.json';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class SharedModule {

}

export class Pokemon {
  static pks: Pokemon[] = DEX.pokemon;

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


  // search a Pokémon by name, return Dex number
  static searchDexByName(name: string): number {
    const r = this.pks.find((p) => p.speciesName === name);
    return r.dex;
  }

  // searches a Pokémon by its name, returns a 'Pokemon' object, returns undefined if not found
  static searchPkByName(name: string): Pokemon {
    const r = this.pks.find((p) => p.speciesName.toLowerCase() === name.toLowerCase());
    return r;
  }

  static getStatProduct(): number {
    return 0;
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
