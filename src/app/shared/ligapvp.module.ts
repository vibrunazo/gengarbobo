import Players from './ligapvp.json';
import Friends from './friends.json';
import Inscritos from './inscritos.json';
import { Friendship } from 'functions/src/friends.model.js';

class PlayerData {
  name: string;
  team: string;
  winrate: string;
  rank?: string;
  code?: number;
  badges?: number;
  medals?: number;
  roles?: string[];
}

// a match between 2 players, contain info on the competing players and the eventual result of the match
export class Match {
  p1: Player;
  p2: Player;
  p1score = 0;
  p2score = 0;

  // returns whether this Player is in this match
  hasPlayer(player: Player): boolean {
    if (this.p1 === player || this.p2 === player) {
      return true;
    }
    return false;
  }

  // returns whether this match is between this 2 players
  hasPlayers(p1: Player, p2: Player): boolean {
    if (this.hasPlayer(p1) && this.hasPlayer(p2)) {
      return true;
    }
    return false;
  }

  // returns true if this match has this player and his enemy has enemyNivel
  enemyHasNivel(player: Player, enemyNivel: Nivel): boolean {
    if (
      this.hasPlayer(player) &&
      this.getEnemyOfPlayer(player).getNivel() === enemyNivel
    ) {
      return true;
    }
    return false;
  }

  // returns the enemy of this player
  getEnemyOfPlayer(player: Player): Player {
    if (this.p1 === player) {
      return this.p2;
    }
    if (this.p2 === player) {
      return this.p1;
    }
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

// will generate multiple CupTables to find the best one
export class CupTableGenerator {
  tables: CupTable[] = [];
  best: CupTable;

  constructor() {
    this.buildCups();
    this.findBestCup();
  }

  buildCups() {
    const n = 1;

    for (let i = 0; i < n; i++) {
      const cup = new CupTable();
      cup.buildMatches();
      this.tables.push(cup);
    }
  }

  findBestCup() {
    let low = this.tables[0].rules.players.length;
    let low2 = 500;
    this.tables.forEach(c => {
      const thisCup = c.diagPlayersWithoutMaxBattles;
      const thisBadTier = c.diagMatchesBadTier;
      console.log(`this: ${thisCup}, ${thisBadTier}`);

      if (thisCup < low) {
        low = thisCup;
        this.best = c;
        // console.log(`best: ${this.best}`);
      } else if (thisCup === low) {
        if (thisBadTier < low2) {
          low2 = thisBadTier;
          this.best = c;
        }
      }
    });
  }
}

// the list of matches on a tournament, or tournament schedule
export class CupTable {
  matches: Match[] = [];
  rules: CupRules;
  summ: Map<Player, PlayerSummary> = new Map<Player, PlayerSummary>();
  diagPlayersWithMaxBattles = 0;
  diagPlayersWithoutMaxBattles = 0;
  diagMatchesBadTier = 0;
  cupLog: string[] = [];
  seed = 0;

  constructor(players?: Player[]) {
    if (!players) {
      players = Liga.getAllPlayers();
      players = players.filter(p => p.getRank() !== Rank.None);
      // console.log(players);
      this.log(players.toString());
    }
    this.rules = new CupRules(players);
  }

  log(log: string) {
    // console.log(log);
    this.cupLog = this.cupLog.concat(log);
  }

  printLog(): string {
    let result = '';
    this.cupLog.forEach(l => (result += `${l}\n`));
    return result;
  }

  printMatches(): string {
    let result = '';
    this.matches.forEach(m => (result += m.toString() + '\n'));
    return result;
  }

  // check if this player has the right number of matches against each tier of enemies
  checkMatcherPerTier(s: PlayerSummary, p: Player) {
    const ruleDia = this.rules.matchesPerNivel[p.getNivel()][Nivel.Diamante];
    const ruleRub = this.rules.matchesPerNivel[p.getNivel()][Nivel.Rubi];
    const ruleSaf = this.rules.matchesPerNivel[p.getNivel()][Nivel.Safira];
    const myDia = s.matchesAgainst.get(Nivel.Diamante);
    const myRub = s.matchesAgainst.get(Nivel.Rubi);
    const mySaf = s.matchesAgainst.get(Nivel.Safira);
    const issDia = Math.abs(ruleDia - myDia);
    const issRub = Math.abs(ruleRub - myRub);
    const issSaf = Math.abs(ruleSaf - mySaf);
    const dia = `${myDia}/${ruleDia}`;
    const rub = `${myRub}/${ruleRub}`;
    const saf = `${mySaf}/${ruleSaf}`;
    const issues = issDia + issRub + issSaf;
    this.diagMatchesBadTier += issues;
    this.log(`${p.getName()} tem ${
      s.matches
    } total de lutas. ${dia} contra Diamantes, ${rub} contra Rubis e ${saf} contra Safiras.
    ${issues} problemas.`);
  }

  checkSummaries() {
    this.summ.forEach((s, p) => {
      this.checkMatcherPerTier(s, p);
    });
    this.log(
      `Jogadores com ${this.rules.maxmatches} batalhas: ${this.diagPlayersWithMaxBattles}`
    );
    this.log(
      `Jogadores sem ${this.rules.maxmatches} batalhas: ${this.diagPlayersWithoutMaxBattles}`
    );
    this.log(`Batalhas de tier errado: ${this.diagMatchesBadTier}`);
  }

  setSummaries() {
    this.matches.forEach(m => {
      this.setSummForPlayer(m.p1, m.p2);
      this.setSummForPlayer(m.p2, m.p1);
    });

    this.summ.forEach((s, p) => {
      if (this.playerHasMaxBattles(p)) {
        this.diagPlayersWithMaxBattles++;
      } else {
        this.diagPlayersWithoutMaxBattles++;
      }
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

  // take the number of players with incomplete matches and try to fix it
  fixProblems() {
    if (this.diagPlayersWithoutMaxBattles === 0) {
      return;
    }
    this.log(
      `Há jogadores com menos de ${this.rules.maxmatches} batalhas. Tentarei consertar.`
    );
    const playersMissingMatches: Player[] = [];

    findPlayersMissingMatches.bind(this)();
    fixPlayersMissingMatches.bind(this)();

    // finds all players missing matches and put them on an array
    function findPlayersMissingMatches() {
      this.summ.forEach((s, p) => {
        if (s.matches < this.rules.maxmatches) {
          playersMissingMatches.push(p);
        }
      });
      this.log(`São eles: ${playersMissingMatches}.`);
    }

    // for each player in the array of players missing matches, try to fix them
    function fixPlayersMissingMatches() {
      playersMissingMatches.forEach(p => {
        fixPlayer.bind(this)(p);
      });
    }

    // this player is missing matches, try to fix it
    function fixPlayer(p: Player) {
      // is there someone else missing games?
      if (playersMissingMatches.length > 1) {
        // if so, can I play the other one?
        const others = playersMissingMatches.filter(p2 => p2 !== p);
        const enemy = others[0];
        if (p.getEnemies().includes(enemy)) {
          this.log(`${p} e ${enemy} são inimigos`);
          // if so, add a match against him
          if (!this.doesBattleExist(p, enemy)) {
            this.addMatch(p, enemy);
          } else {
            this.log(`${p} e ${enemy} já tem uma batalha entre si`);
          }
        } else {
          this.log(`${p} e ${enemy} não são inimigos`);
        }
      }
    }
  }

  buildMatches() {
    let players = this.rules.players;
    // players = players.sort((a, b) => -1);
    players = players.sort((a, b) => a.countEnemies() - b.countEnemies());
    // console.log('players: ' + players);

    players.forEach(p => this.findMatchesForPlayer(p));
    // matches.forEach((m) => console.log(m.toString()));

    this.setSummaries();
    this.checkSummaries();
    this.fixProblems();
  }

  findMatchesForPlayer(player: Player) {
    this.log(`Procurando lutas para ${player.getName()}`);
    // this.matches = this.matches.concat(this.findMatchesPerNivel(player, undefined, 9));
    this.findMatchesPerNivel(player, Nivel.Safira);
    this.findMatchesPerNivel(player, Nivel.Rubi);
    this.findMatchesPerNivel(player, Nivel.Diamante);

    let has = this.countMatchesForPlayer(player);
    let left = this.rules.maxmatches - has;
    if (left > 0) {
      this.log(
        `${player} tem ${has} batalhas e ainda precisa de ${left} batalhas pra completar ${this.rules.maxmatches}`
      );
      this.findMatchesPerNivel(player, player.getNivel(), left);
    }
    has = this.countMatchesForPlayer(player);
    left = this.rules.maxmatches - has;
    if (left > 0) {
      this.log(
        `${player} tem ${has} batalhas e ainda precisa de ${left} batalhas pra completar ${this.rules.maxmatches}`
      );
      this.findMatchesPerNivel(player, undefined, left);
    }
  }

  findMatchesPerNivel(player: Player, nivel: Nivel, ammount = 0) {
    // const result: Match[] = [];

    let max = ammount;
    if (max === 0) {
      max = this.rules.matchesPerNivel[player.getNivel()][nivel];
    }
    const has = this.countMatchesForPlayer(player);
    let nivelName: string = nivel;
    if (!nivel) {
      nivelName = 'qualquer nível';
    }
    this.log(
      `Procurando ${max} inimigos ${nivelName} para ${player.getName()}`
    );
    let enemies = player.getEnemies();
    // let enemies = this.rules.players;
    enemies = enemies.filter(e => e !== player);

    enemies = this.whichPlayersCanStillBattle(player, enemies);
    if (nivel !== undefined) {
      enemies = enemies.filter(e => e.getNivel() === nivel);
    }
    // this.log(enemies.length.toString());
    // this.log(enemies.toString());
    if (enemies.length < max) {
      max = enemies.length;
      this.log(
        `Sobraram apenas ${max} inimigos ${nivelName} para ${player.getName()}`
      );
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
      const nextEnemy = this.rngPickOne(enemies);
      this.log(`Inimigo ${i} será ${nextEnemy.getName()}`);
      this.addMatch(player, nextEnemy);
      // result.push(new Match(player, nextEnemy));
    }

    // console.log(result);
    // result.forEach(m => this.addMatch(m.p1, m.p2));
    // return result;
  }

  // adds a match between this 2 players to the match list
  addMatch(p1: Player, p2: Player) {
    const match = new Match(p1, p2);
    this.log(`Nova batalha: ${p1} x ${p2}`);
    this.matches.push(match);
  }

  // pick one enemy for this player
  rngPickOne(enemies: Player[]) {
    const i = getRandomInt(0, enemies.length);
    const result = enemies[i];
    enemies.splice(i, 1);
    return result;

    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }
  }

  // given an array 'enemies' of Players, return another array of Players
  // containing only the input Players who still has less than the max amount of matches
  // and who have not yet battled 'player'
  whichPlayersCanStillBattle(player: Player, enemies: Player[]): Player[] {
    // remove enemies not in this tournament
    enemies = enemies.filter(p => this.rules.players.includes(p));
    // remove enemies who played more than 9 battles (or whatever is the max for this tournament)
    enemies = enemies.filter(p => !this.playerHasMaxBattles(p));
    // remove enemies that this player already has a battle against
    enemies = enemies.filter(p => !this.doesBattleExist(player, p));

    return enemies;
  }

  // returns how many battles this player has
  // optionally returns only how many battles against enemies of enemyNivel
  countMatchesForPlayer(player: Player, enemyNivel?: Nivel): number {
    let count = 0;
    this.matches.forEach(m => {
      if (
        m.hasPlayer(player) &&
        (!enemyNivel || m.enemyHasNivel(player, enemyNivel))
      ) {
        count++;
      }
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
    return this.countMatchesForPlayer(player) >= this.rules.maxmatches
      ? true
      : false;
  }
  // returns true if this Player already has all their max required battles against players of this nivel
  playerHasMaxBattlesAgainstThisNivel(player: Player, nivel: Nivel): boolean {
    return this.countMatchesForPlayer(player, nivel) >=
      this.rules.matchesPerNivel[player.getNivel()][nivel]
      ? true
      : false;
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
      [Nivel.Safira]: 2
    },
    // Treinador Rubi enfrentará:
    // - 3 diamante
    // - 4 rubi
    // - 2 safira
    [Nivel.Rubi]: {
      [Nivel.Diamante]: 3,
      [Nivel.Rubi]: 4,
      [Nivel.Safira]: 2
    },
    // Treinador Safira enfrentará:
    // - 2 diamante
    // - 2 rubi
    // - 5 safira
    [Nivel.Safira]: {
      [Nivel.Diamante]: 2,
      [Nivel.Rubi]: 2,
      [Nivel.Safira]: 5
    }
  };

  constructor(players: Player[]) {
    this.players = players;
  }
}

export class Player {

  constructor(data: PlayerData) {
    Object.assign(this, data);
  }
  name: string;
  team: string;
  winrate: string;
  rank?: string;
  email?: string;
  code?: number;
  roles?: Role[];
  badges?: number;
  medals?: number;

  static getTierIconFromWinrate(winrate: number): string {
    const tier = this.getTierFromWinrate(winrate);
    return this.getTierIconFromTier(tier);
  }

  static getTierFromWinrate(winrate: number): Nivel {
    const d = winrate;
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

  static getTierIconFromTier(tier: Nivel): string {
    switch (tier) {
      case Nivel.Diamante:
        return '💎';
      case Nivel.Rubi:
        return '🔴';
      case Nivel.Safira:
        return '🔷';

      default:
        return '';
    }
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }
  setEmail(newEmail: string) {
    this.email = newEmail;
  }

  getRoles(): Role[] {
    return this.roles;
  }

  getRolesDesc(): string {
    if (!this.roles || this.roles.length === 0) { return '--'; }
    let result = '';
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.roles.length; i++) {
      result += this.getRoleText(this.roles[i]);
      if (i + 1 < this.roles.length) { result += ', '; }
    }
    return result;
  }

  getRoleText(role: Role): string {
    switch (role) {
      case Role.Admin:
        return 'Admin';
      case Role.TeamFriends:
        return 'Admin de amizades';
      case Role.TeamLeader:
        return 'Líder de equipe';

      default:
        return '';
    }
  }

  getTeam(): Team {
    switch (this.team) {
      case 'rocket':
        return Team.Rocket;
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

  getTeamIcon(): string {
    switch (this.team) {
      case 'rocket':
        // tslint:disable-next-line: max-line-length
        return 'https://trello-attachments.s3.amazonaws.com/5cbe0df2f822f229f94a08f4/480x480/3a8c095912db2251be36d8e4994570a6/ROCKET_TRAN.png';
      case 'aqua':
        // tslint:disable-next-line: max-line-length
        return 'https://trello-attachments.s3.amazonaws.com/5cbe0df71794ed0dd9755c23/400x480/9d1a620a285ad19260bcba6bcd5d4ae5/Time_Aqua.png';
      case 'flare':
        // tslint:disable-next-line: max-line-length
        return 'https://trello-attachments.s3.amazonaws.com/5cbe0e107219957d7c384852/312x350/0026864dec63955ddf1d66558a74457a/Time_Flare.png';
      case 'galactic':
        // tslint:disable-next-line: max-line-length
        return 'https://trello-attachments.s3.amazonaws.com/5cbe0e072e186d03b2eb465b/283x393/70994ee1082b4eccbc70b1f5d6ec7555/Team_Galactic_Logo.png';
      case 'magma':
        return 'https://trello-attachments.s3.amazonaws.com/5cbe0dff88d576199a43a6ed/400x337/0b9e8e08cfa486e3eea39465f7269c85/MAGMA_T.png';
      case 'plasma':
        return 'https://trello-attachments.s3.amazonaws.com/5cbe0e0b04de6443017552c3/894x894/fc2758f6b98ab9a62d8d2c35c6ad4bd9/plasma.png';
      case 'skull':
        // tslint:disable-next-line: max-line-length
        return 'https://lh4.googleusercontent.com/Fya2LhBvPchu4xCtz2I7FlpBB4nzrTtXZ-sC9es6wFYWvLPSCaqbKAThtPM5SHvtLsWTWnOYvqTLHu4X3y2oSjVdKhE3Fqu32ePp17W6ASV30saRNMOb2SE2IA_HnE5pGjXnxYTfpQ=w109-h88';

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

  getTierIcon(): string {
    const tier = this.getNivel();
    return Player.getTierIconFromTier(tier);
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
    return Player.getTierFromWinrate(d);
  }

  /**
   * Returns the Player code. Optionally ask for which part of the code. If part is not set, or zero, returns the full code.
   * @param part If part is 1, 2 or 3. Then return only that part of the full number when split in 3 parts.
   * For example, if the code is '1234 5678 4321' and part = 2, then it will return '5678'.
   */
  getCode(part?: number): number {
    if (part > 0 && part < 4) {
      let str = this.code.toString();
      str = str.substr(part * 4 - 4, 4);
      return +str;
    }
    return this.code;
  }

  setCode(newCode: number) {
    if (!newCode) { return; }
    this.code = +newCode;
  }

  getBadges(): number {
    return this.badges || 0;
  }

  setBadges(newBadges: number) {
    this.badges = newBadges;
    if (!newBadges) { this.badges = 0; }
  }

  getMedals(): number {
    return this.medals || 0;
  }
  setMedals(newMedals: number) {
    this.medals = newMedals;
    if (!newMedals) { this.medals = 0; }
  }

  setName(name: string) {
    this.name = name;
  }
  setTeam(team: string) {
    this.team = team.toLowerCase();
  }
  setWinrate(winrate: string) {
    this.winrate = winrate;
    if (!winrate) { this.winrate = '0'; }
  }


  getFriends(): Player[] {
    const result: Player[] = [];
    const allPlayers = Liga.getAllPlayers();
    allPlayers.forEach(p => {
      if (Liga.areWeFriends(this, p)) {
        result.push(p);
      }
    });
    return result;
  }

  getNonFriends(): Player[] {
    let result: Player[] = [];
    const friends = this.getFriends();
    const all = Liga.getAllPlayers();

    result = all.filter(p => !friends.includes(p) && p !== this);

    return result;
  }

  getColleagues(): Player[] {
    let result: Player[] = [];
    const friends = this.getFriends();

    result = friends.filter(p => p.getTeam() === this.getTeam() && p !== this);

    return result;
  }

  getEnemies(nivel?: Nivel, rank?: string): Player[] {
    const result: Player[] = [];
    const friends = this.getFriends();
    friends.forEach(f => {
      const t = f.team !== this.team;
      // console.log(nivel);
      // console.log(f);
      // console.log(f.getNivel());
      const n = nivel === undefined || nivel === f.getNivel();

      const r = !rank || rank === f.getRank();
      if (t && n && r) {
        result.push(f);
      }
    });
    return result;
  }

  countEnemies(nivel?: Nivel): number {
    // console.log(`${this} has ${this.getEnemies().length} enemies`);

    return this.getEnemies(nivel).length;
  }

  updatePlayerData(newData: PlayerData) {
    Object.assign(this, newData);
    // this.setCode(newData.code);
    let str: string = '' + newData.code;
    str = str.replace(/\s/g, '');
    this.setCode(+str);
    this.setBadges(newData.badges);
    this.setMedals(newData.medals);
    this.setRoles(newData.roles);
  //   name: string;
  // team: string;
  // winrate: string;
  // rank: string;
  // code?: number;
  // badges?: number;
  // medals?: number;

  }

  setRoles(roles: string[]) {
    if (!roles || roles.length === 0) { return; }
    const result = [];
    roles.forEach(r => {
      const role = this.getRoleFromString(r);
      if (role !== null) { result.push(role); }
    });
    this.roles = result;
  }

  getRoleFromString(roleText: string): Role {
    switch (roleText.toLowerCase()) {
      case 'admin':
        return Role.Admin;
      case 'leader':
        return Role.TeamLeader;
      case 'friends':
        return Role.TeamFriends;

      default:
        return null;
    }
  }

  toString(): string {
    return `${this.getName()}`;
  }
}

// const PLAYERS: Player[] = Membros;
// const PLAYERS: Player[] = Players.map(p => new Player(p));

export class Liga {
  static allPlayers: Player[] = Players.map(p => new Player(p));
  static allFriends = Friends;

  // returns an array with all Players competing
  static getAllPlayers(): Player[] {
    return this.allPlayers;
  }

  /**
   * Sets all the players in the list from an array. Updates existing ones, create new ones.
   * @param playerDatas Array of players to set
   */
  static setAllPlayers(playerDatas: PlayerData[]) {
    // const allPlayers: Player[] = players.map(p => new Player(p));
    // this.allPlayers = allPlayers;
    for (const playerData of playerDatas) {
      const p = Liga.getPlayerByName(playerData.name);
      if (p) { p.updatePlayerData(playerData); } else {
        const newPlayer = new Player(playerData);
        this.allPlayers.push(newPlayer);
      }
    }
    // console.log('updated all players');
    // console.log(Liga.getPlayerByName('vib'));


  }

  // returns the Player object that has this name
  static getPlayerByName(name: string): Player {
    return this.allPlayers.find(p => p.getName().toLocaleLowerCase() === name.toLocaleLowerCase());
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

  // returns all players signed up for this tourney
  static getInscritos(tourney: string): Player[] {
    const result: Player[] = [];
    const inscritos: string[] = Inscritos[tourney];
    inscritos.forEach(p => result.push(this.getPlayerByName(p)));

    return result;
  }

  // from this set of players, return only those that are signed up for this tourney
  static filterInscritos(players: Player[], tourney): Player[] {
    if (tourney === 'all') { return players; }
    let result: Player[] = [];
    const inscritos = this.getInscritos(tourney);

    result = players.filter(p => inscritos.includes(p));

    return result;
  }

  // from this set of players, return only those that are of this tier
  static filterPlayersByTier(players: Player[], tier: Nivel): Player[] {
    let result: Player[] = [];
    result = players.filter(p => p.getNivel() === tier);

    return result;
  }

  /**
   * Returns true if this 2 players are friends
   * @param p1 player to check friendship with
   * @param p2 another player to check friendship with
   */
  static areWeFriends(p1: Player, p2: Player): boolean {
    const id = this.getFriendshipID(p1, p2);
    const f = this.getFriendship(id);
    if (!f) { return false; }
    return f.s;
  }

  static getFriendship(id: string): Friendship {
    return this.allFriends[id];
  }

  /**
   * Returns the ID of the friendship between this 2 players.
   * As recorded by the server.
   * @param p1 Player 1
   * @param p2 Player 2
   */
  static getFriendshipID(p1: Player, p2: Player): string {
    const n1 = p1.getName().split('.').join('').toLowerCase();  // remove dots from name
    const n2 = p2.getName().split('.').join('').toLowerCase();  // and force lowercase
    const ids = [n1, n2].sort((a, b) => a.localeCompare(b));
    const id = ids[0] + ids[1];
    return id;
  }

  static setAllFriends(newFriends) {
    this.allFriends = newFriends;
  }

  static getFriendships() {
    return this.allFriends;
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
  Skull = 'Skull',
  Aqua = 'Aqua',
  Rocket = 'Rocket',
  Magma = 'Magma',
  Galactic = 'Galactic',
  Plasma = 'Plasma',
  Flare = 'Flare'
}

// roles each player can have on the website, to determine who has permission to do what
export enum Role {
  Admin,        // can do anything on the website
  TeamLeader,   // can read/write to any member of his team
  TeamFriends   // can write friendships relative to his team
}

// export default Liga;
