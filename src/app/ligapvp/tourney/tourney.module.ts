import { Player, Liga } from 'src/app/shared/ligapvp.module';


export interface TourneyData {
  name: string;
  id: string;
  format?: string;
}
export interface SuperLigaData extends TourneyData {
  t1?;
  t2?;
  t3?;
  t4?;
  t5?;
}

export class Tourney {
  name;
  id;
  format: string;

  constructor(data: TourneyData) {
    this.name = data.name;
    this.id = data.id;
    this.format = data.format;
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

  hasPlayer(p: Player) {
    let result = false;
    this.groups.forEach(g => {
      if (g.hasPlayer(p)) { result = true; }
    });
    return result;
  }

  addPlayerByName(name: string, group: number) {
    const p = Liga.getPlayerByName(name);
    this.addPlayer(p, group, false);
  }

  addPlayer(player: Player, group: number, teamCheck = true) {
    if (this.canAddPlayerToGroup(player, group, teamCheck)) {
      this.groups[group].addPlayer(player);
    }
  }
  delPlayer(player: Player, group: number) {
    this.groups[group].delPlayer(player);
  }

  clear() {
    this.groups.forEach(g => {
      g.clear();
    });
  }

  canAddPlayerToGroup(player: Player, group: number, teamCheck = true) {
    if (teamCheck && this.groups[group].hasTeam(player.getTeam())) { return false; }
    if (this.groups[group].hasPlayer(player)) { return false; }
    if (this.hasPlayer(player)) { return false; }
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

  hasPlayer(player: Player) {
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
