import Players from './ligapvp.json';
import Amizades from './amizades.json';

class PlayerData {
  name: string;
  team: string;
  winrate: string;
  rank: string;
}

// a match between 2 players, contain info on the competing players and the eventual result of the match
export class Match {
  p1: Player;
  p2: Player;
  p1score = 0;
  p2score = 0;


  // returns whether this Player is in this match
  hasPlayer(player: Player): boolean {
    if (this.p1 === player || this.p2 === player) { return true; }
    return false;
  }

  // returns whether this match is between this 2 players
  hasPlayers(p1: Player, p2: Player): boolean {
    if (this.hasPlayer(p1) && this.hasPlayer(p2)) { return true; }
    return false;
  }

  // returns true if this match has this player and his enemy has enemyNivel
  enemyHasNivel(player: Player, enemyNivel: Nivel): boolean {
    if (this.hasPlayer(player) && this.getEnemyOfPlayer(player).getNivel() === enemyNivel) { return true; }
    return false;
  }

  // returns the enemy of this player
  getEnemyOfPlayer(player: Player): Player {
    if (this.p1 === player) { return this.p2; }
    if (this.p2 === player) { return this.p1; }
    return undefined;
  }

  constructor(p1: Player, p2: Player) {
    this.p1 = p1;
    this.p2 = p2;
  }

  public toString(): string {
    return `${this.p1.getName()} x ${this.p2.getName()}`;
  }
}

// a summary of the matches for a player on a tournament
// for each player this will record how many total games it has on the tournament,
// how many games against each tier of enemies
// this will later be used to check if this CupTable is breaking any CupRules
class PlayerSummary {
  matches = 0;
  matchesAgainst: Map<Nivel, number> = new Map<Nivel, number>();

  constructor() {
    this.matches = 0;
    this.matchesAgainst.set(Nivel.Safira, 0);
    this.matchesAgainst.set(Nivel.Rubi, 0);
    this.matchesAgainst.set(Nivel.Diamante, 0);
  }
}

// the list of matches on a tournament
export class CupTable {
  matches: Match[] = [];
  rules: CupRules;
  summ: Map<Player, PlayerSummary> = new Map<Player, PlayerSummary>();
  cupLog: string[] = [];

  constructor(players?: Player[]) {
    if (!players) {
      players = Liga.getAllPlayers();
      players = players.filter(p => p.getRank() !== Rank.None);
    }
    this.rules = new CupRules(players);
  }

  log(log: string) {
    // console.log(log);
    this.cupLog = this.cupLog.concat(log);
  }

  printLog(): string {
    let result = '';
    this.cupLog.forEach(l => result += `${l}\n`);
    return result;
  }

  printMatches(): string {
    let result = '';
    this.matches.forEach(m => result += m.toString() + '\n');
    return result;
  }

  checkSummaries() {
    this.summ.forEach((s, p) => {
      const dia = s.matchesAgainst.get(Nivel.Diamante);
      const rub = s.matchesAgainst.get(Nivel.Rubi);
      const saf = s.matchesAgainst.get(Nivel.Safira);
      this.log(`${p.getName()} tem ${s.matches} total de lutas. ${dia} contra Diamantes, ${rub} contra Rubis e ${saf} contra Safiras.`);
    });
  }

  setSummaries() {
    this.matches.forEach(m => {
      this.setSummForPlayer(m.p1, m.p2);
      this.setSummForPlayer(m.p2, m.p1);
    });
  }

  setSummForPlayer(player: Player, enemy: Player) {
    let s: PlayerSummary = this.summ.get(player);
    if (s === undefined) {
      s = new PlayerSummary();
      this.summ.set(player, s);
    }

    this.summ.get(player).matches++;
    const ma = this.summ.get(player).matchesAgainst.get(enemy.getNivel());
    this.summ.get(player).matchesAgainst.set(enemy.getNivel(), ma + 1);
  }

  buildMatches() {
    let players =  this.rules.players;
    // players = players.sort((a, b) => -1);
    players = players.sort((a, b) => a.countEnemies() - b.countEnemies());
    // console.log('players: ' + players);

    players.forEach( p => this.findMatchesForPlayer(p) );
    // matches.forEach((m) => console.log(m.toString()));

    this.setSummaries();
    this.checkSummaries();
  }

  findMatchesForPlayer(player: Player) {
    this.log(`Procurando lutas para ${player.getName()}`);
    this.matches = this.matches.concat(this.findMatchesPerNivel(player, Nivel.Safira));
    this.matches = this.matches.concat(this.findMatchesPerNivel(player, Nivel.Rubi));
    this.matches = this.matches.concat(this.findMatchesPerNivel(player, Nivel.Diamante));

    let has = this.countMatchesForPlayer(player);
    let left = this.rules.maxmatches - has;
    if (left > 0) {
      this.log(`${player} tem ${has} batalhas e ainda precisa de ${left} batalhas pra completar ${this.rules.maxmatches}`);
      this.matches = this.matches.concat(this.findMatchesPerNivel(player, player.getNivel(), left));
    }
    has = this.countMatchesForPlayer(player);
    left = this.rules.maxmatches - has;
    if (left > 0) {
      this.log(`${player} tem ${has} batalhas e ainda precisa de ${left} batalhas pra completar ${this.rules.maxmatches}`);
      this.matches = this.matches.concat(this.findMatchesPerNivel(player, undefined, left));
    }
  }

  findMatchesPerNivel(player: Player, nivel: Nivel, ammount = 0): Match[] {
    const result: Match[] = [];

    let max = ammount;
    if (max === 0) { max = this.rules.matchesPerNivel[player.getNivel()][nivel]; }
    const has = this.countMatchesForPlayer(player);
    let nivelName: string = nivel;
    if (!nivel) { nivelName = 'qualquer nível'; }
    this.log(`Procurando ${max} inimigos ${nivelName} para ${player.getName()}`);
    let enemies = player.getEnemies();
    enemies = this.whichPlayersCanStillBattle(player, enemies);
    if (nivel !== undefined) { enemies = enemies.filter(e => e.getNivel() === nivel); }
    // this.log(enemies.length.toString());
    // this.log(enemies.toString());
    if (enemies.length < max) {
      max = enemies.length;
      this.log(`Sobraram apenas ${max} inimigos ${nivelName} para ${player.getName()}`);
    }
    if (has > 0) {
      this.log(`${player} já tem ${has} batalhas.`);
      if (has + max > this.rules.maxmatches) {
        // the ammount of extra matches I'm searching for would exceed the max allowed
        max = this.rules.maxmatches - has;
        this.log(`Reduzindo busca para ${max} inimigos.`);
      }
    }
    for (let i = 1; i <= max; i++) {
      this.log(`Inimigo ${i} será ${enemies[i - 1].getName()}`);
      result.push(new Match(player, enemies[i - 1]));
    }

    // console.log(result);

    return result;
  }

  // given an array 'enemies' of Players, return another array of Players
  // containing only the input Players who still has less than the max amount of matches
  // and who have not yet battled 'player'
  whichPlayersCanStillBattle(player: Player, enemies: Player[]): Player[] {
    enemies = enemies.filter( p => !this.playerHasMaxBattles(p) );
    enemies = enemies.filter( p => !this.playerHasMaxBattles(p) );
    enemies = enemies.filter( p => !this.doesBattleExist(player, p));

    return enemies;
  }

  // returns how many battles this player has
  // optionally returns only how many battles against enemies of enemyNivel
  countMatchesForPlayer(player: Player, enemyNivel?: Nivel): number {
    let count = 0;
    this.matches.forEach(m => {
      if (m.hasPlayer(player) && (!enemyNivel || m.enemyHasNivel(player, enemyNivel)) ) { count++; }
    });
    return count;
  }

  // returns true if p1 already has a battle with p2
  doesBattleExist(p1: Player, p2: Player): boolean {
    return this.matches.some(m => m.hasPlayers(p1, p2));
  }

  // returns true if this Player already has all their max required battles
  playerHasMaxBattles(player: Player): boolean {
    // this.log(`${player.getName()} has ${this.countMatchesForPlayer(player)} of ${this.rules.maxmatches} battles`);
    return this.countMatchesForPlayer(player) >= this.rules.maxmatches ? true : false;

  }
  // returns true if this Player already has all their max required battles against players of this nivel
  playerHasMaxBattlesAgainstThisNivel(player: Player, nivel: Nivel): boolean {
    return this.countMatchesForPlayer(player, nivel) >= this.rules.matchesPerNivel[player.getNivel()][nivel] ? true : false;
  }
}

class CupRules {
  players: Player[];
  maxmatches = 9;
  matchesPerNivel = {
    // Treinador Diamante enfrentará:
    // - 4 diamante
    // - 3 rubi
    // - 2 safira
    [Nivel.Diamante]: {
      [Nivel.Diamante]: 4,
      [Nivel.Rubi]: 3,
      [Nivel.Safira]: 2,
    },
    // Treinador Rubi enfrentará:
    // - 3 diamante
    // - 4 rubi
    // - 2 safira
    [Nivel.Rubi]: {
      [Nivel.Diamante]: 3,
      [Nivel.Rubi]: 4,
      [Nivel.Safira]: 2,
    },
    // Treinador Safira enfrentará:
    // - 2 diamante
    // - 2 rubi
    // - 5 safira
    [Nivel.Safira]: {
      [Nivel.Diamante]: 2,
      [Nivel.Rubi]: 2,
      [Nivel.Safira]: 5,
    },
  };

  constructor(players: Player[]) {
    this.players = players;
  }

}

export class Player {
  name: string;
  team: string;
  winrate: string;
  rank: string;

  getName(): string {
    return this.name;
  }

  getTeam(): Team {
    switch (this.team) {
      case 'aqua':
        return Team.Aqua;
      case 'flare':
        return Team.Flare;
      case 'galactic':
        return Team.Galactic;
      case 'magma':
        return Team.Magma;
      case 'plasma':
        return Team.Plasma;
      case 'skull':
        return Team.Skull;

      default:
        return null;
    }
  }

  getRank(): Rank {
    switch (this.rank) {
      case 'bronze':
        return Rank.Bronze;
      case 'silver':
        return Rank.Silver;
      case 'gold':
        return Rank.Gold;

      default:
        return Rank.None;
    }
  }

  getWinrate(): number {
    const str = this.winrate;
    if (str.length > 0) {
      return +str.slice(0, -1);
    }
    return -1;
  }

  getNivel(): Nivel {
    const d = this.getWinrate();
    if (d >= 71) {
      return Nivel.Diamante;
    }
    if (d >= 51 && d < 71) {
      return Nivel.Rubi;
    }
    if (d >= 0 && d < 51) {
      return Nivel.Safira;
    }
    if (d < 0) {
      return Nivel.Safira;
    }
  }

  getFriends(): Player[] {
    const result: Player[] = [];
    const a = Amizades[this.name];
    const keys = Object.keys(a);

    for (const friend of keys) {
      if (a[friend] === 1) {
        result.push(Liga.getPlayerByName(friend));
      }
    }
    return result;
  }

  getEnemies(nivel?: Nivel, rank?: string): Player[] {
    const result: Player[] = [];
    const friends = this.getFriends();
    friends.forEach((f) => {
      const t = (f.team !== this.team);
      // console.log(nivel);
      // console.log(f);
      // console.log(f.getNivel());
      const n = (nivel === undefined  || nivel === f.getNivel());

      const r = (!rank || rank === f.getRank());
      if (t && n && r) {
        result.push(f);
      }
    });
    return result;
  }

  countEnemies(): number {
    // console.log(`${this} has ${this.getEnemies().length} enemies`);

    return this.getEnemies().length;
  }

  constructor(data: PlayerData) {
    Object.assign(this, data);
  }

  toString(): string {
    return `${this.getName()}`;
  }
}

// const PLAYERS: Player[] = Membros;
// const PLAYERS: Player[] = Players.map(p => new Player(p));

export class Liga {
  static allPlayers: Player[] = Players.map(p => new Player(p));

  // returns an array with all Players competing
  static getAllPlayers(): Player[] {
    return this.allPlayers;
  }

  // returns the Player object that has this name
  static getPlayerByName(name: string): Player {
    return this.allPlayers.find((p) => p.getName() === name);
  }

  // returns an array of all players whose winrate matches this Nivel
  // optionally, pass a list of allowed players, if ommited, all players are used
  static getPlayersOfNivel(nivel: Nivel, players?: Player[]): Player[] {
    const result = [];
    if (!players) {
      players = this.allPlayers;
    }
    players.forEach(p => {
      if (p.getNivel() === nivel) {
        result.push(p);
      }
    });
    return result;
  }

  // returns how many players in the competition has a winrate that corresponds to this Nivel
  static getCountNivel(nivel: Nivel): number {
    const players = this.getPlayersOfNivel(nivel);
    return players.length;
  }

  // returns an array of all possible enemies for a player
  static findEnemiesForPlayer(player: Player): Player[] {
    const result: Player[] = [];
    const myNivel = player.getNivel();

    return result;
  }
}

// the label each range of winrate has
export enum Nivel {
  Diamante = 'Diamante',
  Rubi = 'Rubi',
  Safira = 'Safira',
  Newbie = 'Newbie'
}

// ranks in this league
export enum Rank {
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
  None = 'None'
}

// teams in the league
export enum Team {
  Skull,
  Aqua,
  Magma,
  Galactic,
  Plasma,
  Flare
}

// export default Liga;
