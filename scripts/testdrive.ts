// to run this script, use ts-node from the root directory:
// npx ts-node scripts/testdrive.ts

// this script doesn't really do anything

import * as fs from 'fs';
import testData from './testdata.json';
import friendsData from './vfriends.json';
import serverFriends from './vsfriends.json';
import { Member } from 'functions/src/member.model.js';
import { Friendship } from 'functions/src/friends.model.js';
import { readMembers } from 'functions/src/liga.js';

console.log('test script running');

// buildMembers();
// const friendsMap = buildFriends();
// const friendsJson = mapToJson(friendsMap);
// saveToFile(friendsJson);

// serverFriendsToArray(serverFriends);
const allIds = [];
seeIDs();

function seeIDs() {
  const members = testData.members;
  members.forEach(m => {
    const id = genNewID(m);
    allIds.push(id);
  });
  console.log('allIds');
  console.log(allIds);

}


function genNewID(member: Member): string {
  const newId = genIdFromName(member.name);

  return newId;

  function genIdFromName(name: string, i = 1): string {
    let id = name.padEnd(5, '0').slice(0, 5).toLowerCase();
    if (i > 1) {
      const end = i.toString();
      const len = end.length;
      const start = id.slice(0, 5 - len);
      id = start + end;
      console.log('id now');
      console.log(id);

    }
    if (allIds.includes(id)) {
      console.log('id exists ' + id + ' i:' + i);
      id = genIdFromName(name, i + 1);
    }
    return id;
  }
}

function serverFriendsToArray(friends) {
  const a = [];
  console.log(friends);
  for (const [key, value] of Object.entries(friends)) {
    console.log(key + ' = ' + value['s']);
  }
}

function mapToJson(map: Map<string, any>) {
  const result = {};
  // const n = 'a';
  // result[n] = [];
  for (const i of map) {
    // console.log(i);

    const k = i[0]; const v = i[1];
    result[k] = v;
    // result[n].push(k);
  }
  return result;
}
function buildFriends() {
  const rows = friendsData.rowsFriends;
  // const friends: Friendship[] = [];
  const friends: Map<string, Friendship> = new Map();
  const members: Member[] = testData.members;
  const names: string[] = members.map(m => m.name.toLowerCase());
  const verMembers: string[] = [];
  const VERT_ROW = 7;
  const VERT_COL = 2;
  const HORZ_ROW = 5;
  const HORZ_COL = 8;

  console.log('building friends');
  console.log(rows[7][2]);

  // read members on the vertical list
  readVert();
  console.log(friends.get('ravenaut13jcruel13'));
  console.log(friends.get('13jcruel13ravenaut'));
  return(friends);
  // get vertical length
  // read members on the horizontal list
  // get horizontal length
  // do both match?
  // for each member on vertical list
    // for each horizontal member of each vertical member
    // check friendship
    // add to friends list

  function readVert() {
    for (let row = VERT_ROW; row < rows.length; row++) {
      let m = rows[row][VERT_COL];
      if (isMember(m)) {
        m = m.toLowerCase();
        // verMembers.push(m);
        // console.log('vert row: ' + row + ' cell: ' + m);

        readHorz(row, m);
      }
    }
  }
  function readHorz(row: number, vertMember: string) {
    for (let col = HORZ_COL; col < rows[HORZ_ROW].length; col++) {
      let m = rows[HORZ_ROW][col];
      if (isMember(m)) {
        m = m.toLowerCase();
        const statusCell = rows[row][col];
        const status = statusCell === '' ? false : true;
        // console.log('horz col: ' + col + ' cell: ' + m);
        saveFriends(vertMember, m, status);
        // verMembers.push(m);
      }
   }
  }
  function isMember(cell: string): boolean {
    if (cell && names.includes(cell.toLowerCase())) {
      return true;
    }
    return false;
  }
  function saveFriends(friend1: string, friend2: string, status: boolean, comment?: string) {
    if (friend1 === friend2 || !status) { return; }
    const newFriendship: Friendship = {
      s: status,
    };
    const ids = [friend1, friend2].sort((a, b) => a.localeCompare(b));
    const id = ids[0] + ids[1];
    friends.set(id, newFriendship);
  }
}


function buildMembers() {
  const rows = [];
  const members: Member[] = testData.members;

  members.forEach(m => {

  });

  console.log('rows');
  const teams = [];

  buildTeams();
  console.log(members);

  // look into each row on the column for each team to find each member of each team
  // when a team members is found, call the addParamsToMember function on this member
  function buildTeams() {
    // the column each team member can be found on the spreadsheet
    buildTeam('rocket', 2 + 11 * 0);
    buildTeam('aqua', 2 + 11 * 1);
    buildTeam('magma', 2 + 11 * 2);
    buildTeam('galactic', 2 + 11 * 3);
    buildTeam('plasma', 2 + 11 * 4);
    buildTeam('flare', 2 + 11 * 5);
    buildTeam('skull', 2 + 11 * 6);
    // builds one team
    function buildTeam(teamName, column) {
      teams[teamName] = [];
      // tslint:disable-next-line: prefer-for-of
      for (let row = 8; row < rows.length; row++) {
        const name = rows[row][column];
        if (name && name.length > 1) {
          const badges = rows[row][column + 1];
          const medals = rows[row][column + 2];
          addParamsToMember(name.toLocaleLowerCase(), teamName, badges, medals);
          // teams[teamName].push(name.toLocaleLowerCase());
        }
      }
    }
    // once a member is found, adds their parameters to their object
    function addParamsToMember(memberName, teamName, badges, medals) {
      const member = members.find(m => m.name.toLocaleLowerCase() === memberName);
      if (!member) { console.error('addParamsToMember: Could not find member: ' + memberName); return; }
      member.team = teamName;
      if (badges > 0) { member.badges = badges; }
      if (medals > 0) { member.medals = medals; }
    }
  }

}

function saveToFile(dataToSave) {
  // console.log(dataToSave);
  const path = './scripts/out/testdrive.json';
  const json = JSON.stringify(dataToSave);
  // console.log(json);
  // const filetext = 'export const ROWS = ' + json + ';';
  fs.writeFile(path, json, 'utf8', (e) => {
    console.log('creating json: ' + path);
    if (e) { console.log('' + e);
    } else { console.log('success'); }
  });
}
