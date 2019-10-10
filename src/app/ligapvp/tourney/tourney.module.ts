import { Player, Liga } from 'src/app/shared/ligapvp.module';


export interface TourneyData {
  name: string;
  id: string;
  format?: string;
  theme?: string;
  players?: string[]; // player names
  groups?: TourneyGroup[];
}
export interface SuperLigaData extends TourneyData {
  t1?;
  t2?;
  t3?;
  t4?;
  t5?;
}

export interface TourneyGroup {
  name: string;
  players: string[];
  bgColor?: string;
  icon?: string;
}

export class Tourney {
  data: TourneyData = {
    name: '',
    id: ''
  };
  private players: Player[] = []; // player objects

  constructor(data: TourneyData) {
    this.data = JSON.parse(JSON.stringify(data));
    // Object.assign(this.data, data);
    // this.data = data;
    this.buildPlayers(data);
  }

  buildPlayers(data: TourneyData) {
    this.data.groups.forEach(g => g.players = g.players.map(p => this.addPlayerByName(p)));
    if (data.players && data.players.length > 0) {
      data.players.map(p => p.toLowerCase());
      data.players.forEach(p => this.players.push(Liga.getPlayerByName(p)));
    }
  }

  getName(): string {
    return this.data.name;
  }
  getID(): string {
    return this.data.id;
  }
  getFormat(): string {
    return this.data.format;
  }
  getTheme(): string {
    return this.data.theme;
  }
  getPlayers(): Player[] {
    return this.players;
  }
  getPlayersNotInGroups(): Player[] {
    return this.players.filter(p => this.findGroupOfPlayer(p.getName()) < 0);
  }
  getPlayerNames(): string[] {
    return this.data.players;
  }

  findGroupOfPlayer(pName: string): number {
    for (let index = 0; index < this.data.groups.length; index++) {
      if (this.data.groups[index].players.includes(pName.toLowerCase())) {
        return index;
      }
    }
    return -1;
  }

  addPlayerByName(pName: string): string {
    if (!pName || pName === '' || this.hasPlayer(pName)) { return pName.toLowerCase(); }
    const newPlayer = Liga.getPlayerByName(pName);
    this.players.push(newPlayer);
    this.data.players.push(pName);
    return pName.toLowerCase();
  }
  addPlayer(newPlayer: Player) {
    if (!newPlayer || this.hasPlayer(newPlayer.getName())) { return; }
    this.players.push(newPlayer);
    this.data.players.push(newPlayer.getName().toLowerCase());
  }
  delPlayer(player: Player) {
    this.players = this.players.filter(p => !p.is(player));
    this.data.players = this.data.players.filter(p => (p.toLowerCase() !== player.getName().toLowerCase()));
    this.delFromAllGroups(player.getName());
  }
  hasPlayer(playerName: string): boolean {
    return this.data.players.includes(playerName.toLowerCase());
  }

  getGroups(): TourneyGroup[] {
    return this.data.groups;
  }

  getPlayersFromGroupData(group: TourneyGroup): Player[] {
    const result: Player[] = [];
    group.players.forEach(pName => result.push(Liga.getPlayerByName(pName)));
    // console.log('getting players from group');
    // console.log(result);

    return result;
  }

  addToGroup(pName: string, group: number) {
    this.delFromAllGroups(pName);
    this.data.groups[group].players.push(pName.toLowerCase());
  }
  delFromGroup(pName: string, group: number) {
    this.data.groups[group].players = this.data.groups[group].players.filter(p => p !== pName.toLowerCase());
  }
  delFromAllGroups(pName: string) {
    this.data.groups.forEach(g => g.players = g.players.filter(p => p !== pName.toLowerCase()));
  }
}

export class LigaPrincipal extends Tourney {

}

export class SuperLiga extends Tourney {
  t1;
  t2;
  t3;
  t4;
  t5;
  t1Players: Player[];
  t2Players: Player[];
  t3Players: Player[];
  t4Players: Player[];
  t5Players: Player[];
  groups: SLGroup[] = [];

  constructor(data: SuperLigaData) {
    super(data);
    this.t1 = data.t1;
    this.t2 = data.t2;
    this.t3 = data.t3;
    this.t4 = data.t4;
    this.t5 = data.t5;
    this.setAllPlayers();
    this.setAllGroups();
  }

  hasPlayerInGroups(p: Player) {
    let result = false;
    this.groups.forEach(g => {
      if (g.hasPlayerInGroup(p)) { result = true; }
    });
    return result;
  }

  addPlayerToGroupByName(name: string, group: number) {
    const p = Liga.getPlayerByName(name);
    this.addPlayerToGroup(p, group, false);
  }

  addPlayerToGroup(player: Player, group: number, teamCheck = true) {
    if (this.canAddPlayerToGroup(player, group, teamCheck)) {
      this.groups[group].addPlayer(player);
    }
  }
  delPlayerFromGroup(player: Player, group: number) {
    this.groups[group].delPlayer(player);
  }

  clear() {
    this.groups.forEach(g => {
      g.clear();
    });
  }

  canAddPlayerToGroup(player: Player, group: number, teamCheck = true) {
    if (teamCheck && this.groups[group].hasTeam(player.getTeam())) { return false; }
    if (this.groups[group].hasPlayerInGroup(player)) { return false; }
    if (this.hasPlayerInGroups(player)) { return false; }
    return true;
  }

  setAllGroups() {
    this.groups.push(new SLGroup('A'));
    this.groups.push(new SLGroup('B'));
    this.groups.push(new SLGroup('C'));
    this.groups.push(new SLGroup('D'));
    this.groups.push(new SLGroup('E'));
    this.groups.push(new SLGroup('F'));
    this.groups.push(new SLGroup('G'));
    this.groups.push(new SLGroup('H'));
  }

  setAllPlayers() {
    this.t1Players = this.getPlayersFromTier(1);
    this.t2Players = this.getPlayersFromTier(2);
    this.t3Players = this.getPlayersFromTier(3);
    this.t4Players = this.getPlayersFromTier(4);
    this.t5Players = this.getPlayersFromTier(5);
  }

  getPlayersFromTier(tierNumber: number): Player[] {
    let tier = this.t1;
    const result: Player[] = [];
    switch (tierNumber) {
      case 1:
        tier = this.t1;
        break;
      case 2:
        tier = this.t2;
        break;
      case 3:
        tier = this.t3;
        break;
      case 4:
        tier = this.t4;
        break;
      case 5:
        tier = this.t5;
        break;

      default:
        break;
    }
    tier.forEach(p => {
      result.push(Liga.getPlayerByName(p));
    });
    return result;
  }

}

class SLGroup {
  name;
  players: Player[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addPlayer(player: Player) {
    if (this.players.includes(player)) { return; }
    this.players.push(player);
  }
  delPlayer(player: Player) {
    // if (!this.players.includes(player)) { return; }
    this.players = this.players.filter(p => !p.is(player));
  }

  clear() {
    this.players = [];
  }

  hasPlayerInGroup(player: Player) {
    return this.players.includes(player);
  }

  hasTeam(team: string) {
    let result = false;
    this.players.forEach(p => {
      if (p.isTeam(team)) { result = true; }
    });
    return result;
  }
}
