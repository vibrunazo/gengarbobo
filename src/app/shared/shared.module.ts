import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import DEX from './gamemaster.json';
import CPM from './cpm.json';

@NgModule({
  declarations: [],
  imports: [CommonModule]
})
export class SharedModule {}

export class Move {
  moveId: string;
  name: string;
  type: string;
  power: number;
  energy: number;
  energyGain: number;
  cooldown?: number;
  buffs?: number[];
  buffTarget?: string;
  buffApplyChance?: string;

  static findMoveById(id: string): Move {
    const move: Move = DEX.moves.find((m) => {
      return m.moveId === id;
    });
    return move;
  }

  constructor() {

  }

}

// "moveId": "ANCIENT_POWER",
//       "name": "Ancient Power",
//       "type": "rock",
//       "power": 70,
//       "energy": 45,
//       "energyGain": 0,
//       "cooldown": 500,
// 	  "buffs": [2, 2],
// 	  "buffTarget": "self",
// 	  "buffApplyChance": ".1"
//     },

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

  // returns an array with all the fast moves as 'Move' objects
  getFastMoves(): Move[] {
    const moves: Move[] = [];
    this.species.fastMoves.forEach((m) => {
      moves.push(Move.findMoveById(m));
    });
    return moves;
  }

  // returns the fast Move that offers the best moveset dps
  // considers both the move dps and energy gain,
  // depends on best getBestChargedMove to calculate moveset dps
  getBestFastMove(): Move {
    const moves: Move[] = this.getFastMoves();
    const charged = this.getBestChargedMove();
    let best = moves[0];
    let bestdps = 0;
    moves.forEach((m) => {
      if (bestdps < this.getMovesetDPS(m, charged)) {
        bestdps = this.getMovesetDPS(m, charged);
        best = m;
      }
    });
    return best;
  }

  getBestDPS(): number {
    return this.getMovesetDPS(this.getBestFastMove(), this.getBestChargedMove());
  }

  getMovesetDPS(fast: Move, charged: Move): number {

    return this.getFastMoveDPS(fast) + (this.getChargedMoveDpe(charged) * this.getFastMoveEPS(fast));
  }

  // returns the dps of spamming this fast move, STAB considered if any
  getFastMoveDPS(move: Move): number {
    return this.getSTAB(move) * 1000 * move.power / move.cooldown;
  }

  // returns the energy per second of spamming this fast move
  getFastMoveEPS(move: Move): number {
    return move.energyGain * 1000 / move.cooldown;
  }

  // returns an array with all charged Moves as Move objects
  getChargedMoves(): Move[] {
    const moves: Move[] = [];
    this.species.chargedMoves.forEach((m) => {
      moves.push(Move.findMoveById(m));
    });
    return moves;
  }

  // returns the charged Move that offers the best moveset dpe
  // it's a simple damage per energy calculation,
  // modified by STAB if it has it
  getBestChargedMove(): Move {
    const moves: Move[] = this.getChargedMoves();
    let best: Move;
    let bestdpe = 0;
    moves.forEach((m) => {
      if (bestdpe < this.getChargedMoveDpe(m)) {
        bestdpe = this.getChargedMoveDpe(m);
        best = m;
      }
    });
    return best;
  }

  // returns the Damage Per Energy of a charged move for this pokémon, considers STAB
  getChargedMoveDpe(move: Move): number {
    return this.getSTAB(move) * move.power / move.energy;
  }

  // returns 1.2 if this move has STAB with this pokémon, 1 if it does not
  getSTAB(move: Move): number {
    if (this.species.types.includes(move.type)) {
      return 1.2;
    }
    return 1;
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
