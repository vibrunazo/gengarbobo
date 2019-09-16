import { Member } from "./member.model";
import * as functions from 'firebase-functions';
import { Friendship } from "./friends.model";
// const {OAuth2Client} = require('google-auth-library');
const {google} = require('googleapis');

// const CONFIG_CLIENT_ID = functions.config().googleapi.client_id;
// const CONFIG_CLIENT_SECRET = functions.config().googleapi.client_secret;
const CONFIG_SHEET_ID = functions.config().googleapi.sheet_id;

export function getMembersFromRows(rows: Array<any>): Member[] {
  const result: Member[] = [];
  rows.forEach(r => {
    if (r[0] && r[0].length > 1) {
      const newMember: Member = {
        name: r[0],
        team: '',
        winrate: +r[6].replace('%', ''),
        code: r[1].replace(/\s/g, ''),
      }
      result.push(newMember);
    }
  });
  return result;
}

export function getFriendsFromRows(rows: Array<any>, members: Member[]): Map<string, Friendship> {
  let result: Map<string, Friendship>;
  result = buildFriends();

  function buildFriends(): Map<string, Friendship> {
    // const friends: Friendship[] = [];
    const friends: Map<string, Friendship> = new Map();
    const names: string[] = members.map(m => m.name.toLowerCase());
    const VERT_ROW = 7;
    const VERT_COL = 2;
    const HORZ_ROW = 5;
    const HORZ_COL = 8;
    let friendCount = 0;

    console.log('building friends');
    // console.log(rows[7][2]);

    // read members on the vertical list
    readVert();
    console.log('saved a total of ' + friendCount + ' from sheets.');

    // console.log(friends);
    // console.log(friends.get('ravenaut13jcruel13'));
    // console.log(friends.get('13jcruel13ravenaut'));
    return friends;
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
      const n1 = friend1.split('.').join("");
      const n2 = friend2.split('.').join("");
      const newFriendship: Friendship = {
        s: status,
      };
      const ids = [n1, n2].sort((a, b) => a.localeCompare(b));
      const id = ids[0] + ids[1];
      friendCount++;
      friends.set(id, newFriendship);
    }
  }
  return result;
}

// give me the rows from the Equipes Sheet and the current list of members
// I'll add the parameters I find in those rows to those members
export function setMemberParamsFromEquipesRows(rows: Array<any>, members: Member[]) {
  buildTeams();
  // console.log(members);

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
      // tslint:disable-next-line: prefer-for-of
      for (let row = 8; row < rows.length; row++) {
        const name = rows[row][column];
        if (name && name.length > 1) {
          const badges = rows[row][column + 1];
          const medals = rows[row][column + 2];
          addParamsToMember(name.toLowerCase(), teamName, badges, medals);
        }
      }
    }
    // once a member is found, adds their parameters to their object
    function addParamsToMember(memberName, teamName, badges, medals) {
      const member = members.find(m => m.name.toLowerCase() === memberName);
      if (!member) { console.error('addParamsToMember: Could not find member: ' + memberName); return; }
      member.team = teamName;
      if (badges > 0) { member.badges = badges; }
      if (medals > 0) { member.medals = medals; }
    }
  }
}

export async function readAmizadesRows(client): Promise<string[][]>  {
  return readRangeRows(client, 'AMIZADES!A1:DH150');
}
export async function readMembrosRows(client) {
  return readRangeRows(client, 'MEMBROS!A1:G150');
}
export async function readEquipesRows(client) {
  return readRangeRows(client, 'EQUIPES!!A1:BZ23');
}

export async function readRangeRows(client: any, range: string): Promise<string[][]> {
  const p: Promise<string[][]>  = new Promise((resolve, reject) => {
    // start promise
    // const range = 'MEMBROS!A1:G150';
    // console.log('range:' + range);
    const sheetid = CONFIG_SHEET_ID;
    const sheets = google.sheets('v4');
    const requestWithoutAuth: any = {
      spreadsheetId: sheetid,
      range: range,
    };
    const request = requestWithoutAuth;
    request.auth = client;
    let rows = [];

    sheets.spreadsheets.values.get(request, (gerr, gres) => {
      if (gerr) {
        reject(gerr);
        return;
      }
      rows = gres.data.values;
      resolve(rows);
    });

    // end promise
  });

  return p;
}

export async function getClient(getAuthorizedClient) {
  const p = new Promise((resolve, reject) => {
    getAuthorizedClient()
    .then(async (client) => {
      resolve(client);
    }).catch(e => reject(e));
  });
  return p;
}

