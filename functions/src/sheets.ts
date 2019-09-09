import { Member } from "./member.model";
import * as functions from 'firebase-functions';
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
        winrate: r[6],
        code: r[1],
      }
      result.push(newMember);
    }
  });
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
          addParamsToMember(name.toLocaleLowerCase(), teamName, badges, medals);
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

export async function readMembrosRows(client) {
  return readRangeRows(client, 'MEMBROS!A1:G150');
}
export async function readEquipesRows(client) {
  return readRangeRows(client, 'EQUIPES!!A1:BZ23');
}

export async function readRangeRows(client: any, range: string) {
  const p = new Promise((resolve, reject) => {
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

