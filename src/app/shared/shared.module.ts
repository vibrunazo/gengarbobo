// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import DEX from './gamemaster.json';
import CPM from './cpm.json';

// @NgModule({
//   declarations: [],
//   imports: [CommonModule]
// })
// export class SharedModule {}

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
    const move: Move = DEX.moves.find(m => {
      return m.moveId === id;
    });
    return move;
  }

  static getAllMoves(): Move[] {
    return DEX.moves;
  }

  constructor() {}
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
    atk?: number;
    def?: number;
    hp?: number;
  };
  types: string[];
  fastMoves: string[];
  chargedMoves: string[];
  legacyMoves?: string[];
  tags?: string[];
  eliteMoves?: string[];
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

  // returns an array with the name of every pokémon
  static getFullList(): string[] {
    const list: string[] = [];
    DEX.pokemon.forEach(p => {
      list.push(p.speciesName);
    });
    return list;
  }

  // search a Pokémon by name, return Dex number
  static searchDexByName(name: string): number {
    const r = this.dex.find(p => p.speciesName === name);
    return r.dex;
  }

  // searches a Pokémon by its name, returns a 'Pokemon' object, returns undefined if not found
  static searchPkByName(name: string): PokemonSpecies {
    const r = this.dex.find(p => p.speciesName.toLowerCase() === name.toLowerCase());
    return r;
  }

  // returns the CP Multiplier for a pokémon of this level
  static getCPMFromLevel(level: number): number {
    const i = level * 2 - 2;

    return CPM[i];
  }

  // gets the nest FAST Move for a Pokémon of this PokemonSpecies
  // if you need to get a PokemonSpecies you can use Pokemon.searchPkByName()
  static getBestMoveBySpecies(species: PokemonSpecies): Move {
    const moves: Move[] = Pokemon.getFastMoves(species);
    const charged = Pokemon.getBestChargedMove(species);
    let best = moves[0];
    let bestdps = 0;
    moves.forEach(m => {
      if (bestdps < Pokemon.getMovesetDPS(m, charged, species)) {
        bestdps = Pokemon.getMovesetDPS(m, charged, species);
        best = m;
      }
    });
    return best;
  }

  static getMovesetDPS(fast: Move, charged: Move, species: PokemonSpecies): number {
    return Pokemon.getFastMoveDPS(fast, species) + Pokemon.getChargedMoveDpe(charged, species) * Pokemon.getFastMoveEPS(fast);
  }

  // returns the dps of spamming this fast move, STAB considered if any
  static getFastMoveDPS(move: Move, species: PokemonSpecies): number {
    return (Pokemon.getSTAB(move, species) * 1000 * move.power) / move.cooldown;
  }

  // returns the energy per second of spamming this fast move
  static getFastMoveEPS(move: Move): number {
    return (move.energyGain * 1000) / move.cooldown;
  }

  // returns an array with all the fast moves as 'Move' objects
  static getFastMoves(species: PokemonSpecies): Move[] {
    const moves: Move[] = [];
    species.fastMoves.forEach(m => {
      moves.push(Move.findMoveById(m));
    });
    return moves;
  }

  // returns the charged Move that offers the best moveset dpe
  // it's a simple damage per energy calculation,
  // modified by STAB if it has it
  static getBestChargedMove(species: PokemonSpecies): Move {
    const moves: Move[] = Pokemon.getChargedMoves(species);
    let best: Move;
    let bestdpe = 0;
    moves.forEach(m => {
      if (bestdpe < Pokemon.getChargedMoveDpe(m, species)) {
        bestdpe = Pokemon.getChargedMoveDpe(m, species);
        best = m;
      }
    });
    return best;
  }

  // returns the Damage Per Energy of a charged move for this pokémon, considers STAB
  static getChargedMoveDpe(move: Move, species: PokemonSpecies): number {
    return (Pokemon.getSTAB(move, species) * move.power) / move.energy;
  }

  // returns 1.2 if this move has STAB with this pokémon, 1 if it does not
  static getSTAB(move: Move, species: PokemonSpecies): number {
    if (species.types.includes(move.type)) {
      return 1.2;
    }
    return 1;
  }

  // returns an array with all charged Moves as Move objects
  static getChargedMoves(species: PokemonSpecies): Move[] {
    const moves: Move[] = [];
    species.chargedMoves.forEach(m => {
      moves.push(Move.findMoveById(m));
    });
    return moves;
  }

  // returns the end result of a duel between 2 pokémon using only fast moves
  // returns a positive number if the first pokémon wins, negative if it loses
  // the return value is how much health the winner has left
  static getFmDuel(pk1: Pokemon, pk1move: Move, pk2: Pokemon, pk2move: Move): number {
    // TODO: should not assume pk1move and pk2move have the same duration
    const p1dmg = Pokemon.getDamageToEnemy(pk1, pk1move, pk2);         // how much dmg p1 does to p2 per attack
    const p2dmg = Pokemon.getDamageToEnemy(pk2, pk2move, pk1);         // how much dmg p2 does to p1 per attack
    const p1atks = Math.floor(pk2.stats.hp / p1dmg);          // how many attacks p1 needs to kill p2
    const p2atks = Math.floor(pk1.stats.hp / p2dmg);          // how many attacks p2 needs to kill p1
    const atks = Math.min(p1atks, p2atks);                    // how many attacks the fight will last
    const p2hp = Math.max(pk2.stats.hp - atks * p1dmg, 0);    // how much health left p2 have when it's over
    const p1hp = Math.max(pk1.stats.hp - atks * p2dmg, 0);    // how much health left p1 have when it's over
    const d = p1hp - p2hp;                                    // the difference between their health
    return d;

  }

  // how much damage I do with this move to this enemy
  static getDamageToEnemy(p1: Pokemon, move: Move, enemy: Pokemon) {
    const atk = p1.stats.atk;
    const def = enemy.stats.def;
    const pow = move.power;
    const bonus = 1.3;
    const eff = Pokemon.getEffectiveness(p1, move.type, enemy.species.types);

    return Math.floor((0.5 * Pokemon.getSTAB(move, p1.species) * eff * bonus * pow * atk) / def) + 1;
  }


  // Given a move type and array of defensive types, return the final type effectiveness multiplier
  // taken from pvpoke
  static getEffectiveness(p1: Pokemon, moveType: string, targetTypes: string[]): number {
    let effectiveness = 1;

    moveType = moveType.toLowerCase();

    for (let type of targetTypes) {
      type = type.toLowerCase();
      const traits = Pokemon.getTypeTraits(type);

      if (traits.weaknesses.includes(moveType)) {
        effectiveness *= 1.6;
      } else if (traits.resistances.includes(moveType)) {
        effectiveness *= 0.625;
      } else if (traits.immunities.includes(moveType)) {
        effectiveness *= 0.390625;
      }
    }

    return effectiveness;
  }




  // Helper function that returns an array of weaknesses, resistances, and immunities given defensive type
  // taken from https://github.com/pvpoke/pvpoke/blob/master/src/js/battle/Battle.js
  static getTypeTraits(type) {
    let traits = {
      weaknesses: [],
      resistances: [],
      immunities: []
    };

    switch (type) {
      case 'normal':
        traits = {
          resistances: [],
          weaknesses: ['fighting'],
          immunities: ['ghost']
        };
        break;

      case 'fighting':
        traits = {
          resistances: ['rock', 'bug', 'dark'],
          weaknesses: ['flying', 'psychic', 'fairy'],
          immunities: []
        };
        break;

      case 'flying':
        traits = {
          resistances: ['fighting', 'bug', 'grass'],
          weaknesses: ['rock', 'electric', 'ice'],
          immunities: ['ground']
        };
        break;

      case 'poison':
        traits = {
          resistances: ['fighting', 'poison', 'bug', 'fairy', 'grass'],
          weaknesses: ['ground', 'psychic'],
          immunities: []
        };
        break;

      case 'ground':
        traits = {
          resistances: ['poison', 'rock'],
          weaknesses: ['water', 'grass', 'ice'],
          immunities: ['electric']
        };
        break;

      case 'rock':
        traits = {
          resistances: ['normal', 'flying', 'poison', 'fire'],
          weaknesses: ['fighting', 'ground', 'steel', 'water', 'grass'],
          immunities: []
        };
        break;

      case 'bug':
        traits = {
          resistances: ['fighting', 'ground', 'grass'],
          weaknesses: ['flying', 'rock', 'fire'],
          immunities: []
        };
        break;

      case 'ghost':
        traits = {
          resistances: ['poison', 'bug'],
          weaknesses: ['ghost', 'dark'],
          immunities: ['normal', 'fighting']
        };
        break;

      case 'steel':
        traits = {
          resistances: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'],
          weaknesses: ['fighting', 'ground', 'fire'],
          immunities: ['poison']
        };
        break;

      case 'fire':
        traits = {
          resistances: ['bug', 'steel', 'fire', 'grass', 'ice', 'fairy'],
          weaknesses: ['ground', 'rock', 'water'],
          immunities: []
        };
        break;

      case 'water':
        traits = {
          resistances: ['steel', 'fire', 'water', 'ice'],
          weaknesses: ['grass', 'electric'],
          immunities: []
        };
        break;

      case 'grass':
        traits = {
          resistances: ['ground', 'water', 'grass', 'electric'],
          weaknesses: ['flying', 'poison', 'bug', 'fire', 'ice'],
          immunities: []
        };
        break;

      case 'electric':
        traits = {
          resistances: ['flying', 'steel', 'electric'],
          weaknesses: ['ground'],
          immunities: []
        };
        break;

      case 'psychic':
        traits = {
          resistances: ['fighting', 'psychic'],
          weaknesses: ['bug', 'ghost', 'dark'],
          immunities: []
        };
        break;

      case 'ice':
        traits = {
          resistances: ['ice'],
          weaknesses: ['fighting', 'fire', 'steel', 'rock'],
          immunities: []
        };
        break;

      case 'dragon':
        traits = {
          resistances: ['fire', 'water', 'grass', 'electric'],
          weaknesses: ['dragon', 'ice', 'fairy'],
          immunities: []
        };
        break;

      case 'dark':
        traits = {
          resistances: ['ghost', 'dark'],
          weaknesses: ['fighting', 'fairy', 'bug'],
          immunities: ['psychic']
        };
        break;

      case 'fairy':
        traits = {
          resistances: ['fighting', 'bug', 'dark'],
          weaknesses: ['poison', 'steel'],
          immunities: ['dragon']
        };
        break;
    }

    return traits;
  }

  constructor(species: PokemonSpecies, level: number, atkiv: number, defiv: number, hpiv: number) {
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
    this.stats.hp = Math.floor((this.species.baseStats.hp + this.iv.hp) * cpm);
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

  // returns the end result of a duel between 2 pokémon using only fast moves
  // returns a positive number if the first pokémon wins, negative if it loses
  // the return value is how much health the winner has left
  getFmDuel(pk1move: Move, pk2: Pokemon, pk2move: Move): number {
    // TODO: should not assume pk1move and pk2move have the same duration

    const p1dmg = this.getDamageToEnemy(pk1move, pk2);         // how much dmg p1 does to p2 per attack
    const p2dmg = pk2.getDamageToEnemy(pk2move, this);         // how much dmg p2 does to p1 per attack
    const p1atks = Math.floor(pk2.stats.hp / p1dmg);          // how many attacks p1 needs to kill p2
    const p2atks = Math.floor(this.stats.hp / p2dmg);          // how many attacks p2 needs to kill p1
    const atks = Math.min(p1atks, p2atks);                    // how many attacks the fight will last
    const p2hp = Math.max(pk2.stats.hp - atks * p1dmg, 0);    // how much health left p2 have when it's over
    const p1hp = Math.max(this.stats.hp - atks * p2dmg, 0);    // how much health left p1 have when it's over
    const d = p1hp - p2hp;                                    // the difference between their health
    return d;

  }

  // returns an array with all the fast moves as 'Move' objects
  getFastMoves(): Move[] {
    const moves: Move[] = [];
    this.species.fastMoves.forEach(m => {
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
    moves.forEach(m => {
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
    return this.getFastMoveDPS(fast) + this.getChargedMoveDpe(charged) * this.getFastMoveEPS(fast);
  }

  // returns the dps of spamming this fast move, STAB considered if any
  getFastMoveDPS(move: Move): number {
    return (Pokemon.getSTAB(move, this.species) * 1000 * move.power) / move.cooldown;
  }

  // returns the energy per second of spamming this fast move
  getFastMoveEPS(move: Move): number {
    return (move.energyGain * 1000) / move.cooldown;
  }

  // returns an array with all charged Moves as Move objects
  getChargedMoves(): Move[] {
    const moves: Move[] = [];
    this.species.chargedMoves.forEach(m => {
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
    moves.forEach(m => {
      if (bestdpe < this.getChargedMoveDpe(m)) {
        bestdpe = this.getChargedMoveDpe(m);
        best = m;
      }
    });
    return best;
  }

  // returns the Damage Per Energy of a charged move for this pokémon, considers STAB
  getChargedMoveDpe(move: Move): number {
    return (Pokemon.getSTAB(move, this.species) * move.power) / move.energy;
  }

  // how much damage I do with this move to this enemy
  getDamageToEnemy(move: Move, enemy: Pokemon) {
    const atk = this.stats.atk;
    const def = enemy.stats.def;
    const pow = move.power;
    const bonus = 1.3;
    const eff = this.getEffectiveness(move.type, enemy.species.types);

    return Math.floor((0.5 * Pokemon.getSTAB(move, this.species) * eff * bonus * pow * atk) / def) + 1;
  }

  // Given a move type and array of defensive types, return the final type effectiveness multiplier
  // taken from pvpoke
  getEffectiveness(moveType: string, targetTypes: string[]): number {
    let effectiveness = 1;

    moveType = moveType.toLowerCase();

    for (let type of targetTypes) {
      type = type.toLowerCase();
      const traits = Pokemon.getTypeTraits(type);

      if (traits.weaknesses.includes(moveType)) {
        effectiveness *= 1.6;
      } else if (traits.resistances.includes(moveType)) {
        effectiveness *= 0.625;
      } else if (traits.immunities.includes(moveType)) {
        effectiveness *= 0.390625;
      }
    }

    return effectiveness;
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

export default Pokemon;

export const LEAGUES = {
  1500:  'great',
  2500:  'ultra',
  0:  'master',
};
