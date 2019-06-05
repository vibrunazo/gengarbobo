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
    atk: 0,
    def: 0,
    hp: 0
  };
  iv = {
    atk: 0,
    def: 0,
    hp: 0
  };
  cp = 10;
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

  // returns the CP Multiplier for a pokémon of this level
  static getCPMFromLevel(level: number): number {
    const i = level * 2 - 2;

    return CPM[i].cpm;
  }

  constructor(
    species: PokemonSpecies,
    level: number,
    atkiv: number,
    defiv: number,
    hpiv: number
  ) {
    this.iv.atk = atkiv;
    this.iv.def = defiv;
    this.iv.hp = hpiv;

    this.species = species;

    this.setLevel(level);
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
    return Math.floor((atk * def ** 0.5 * hp ** 0.5 * cpm ** 2) / 10);
  }

  setLevel(newLevel: number) {
    this.level = newLevel;
    const cpm = Pokemon.getCPMFromLevel(newLevel);
    this.stats.atk = (this.species.baseStats.atk + this.iv.atk) * cpm;
    this.stats.def = (this.species.baseStats.def + this.iv.def) * cpm;
    this.stats.hp = (this.species.baseStats.hp + this.iv.hp) * cpm;
    this.cpm = cpm;
    this.cp = this.getCP();
    this.statprod = this.getStatProd();
  }

  // returns whether this pokémon can fight in 'great' or 'ultra' league.
  // Returns true if CP is <= 1500 for 'great', or <= 2500 for 'ultra'. False otherwise
  canFightLeague(league: string): boolean {
    switch (league) {
      case 'great':
        if (this.cp <= 1500) {
          return true;
        }
        return false;
        break;
      case 'ultra':
        if (this.cp <= 2500) {
          return true;
        }
        return false;

      default:
        break;
    }
    return true;
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
