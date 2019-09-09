// to run this script, use ts-node from the root directory:
// npx ts-node scripts/testdrive.ts

// this script doesn't really do anything

import * as fs from 'fs';
import testData from './testdata.json';
import { Member } from 'functions/src/member.model.js';

console.log('test script running');

buildMembers();
// saveToFile();


function buildMembers() {
  const rows = testData.rowsEquipes;
  const members: Member[] = testData.newMembers;

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

function saveToFile() {
  const path = './src/app/dex/tableItems.ts';
  const json = JSON.stringify(null);
  const filetext = 'export const ROWS = ' + json + ';';
  fs.writeFile(path, filetext, 'utf8', (e) => {
    console.log('creating json: ' + path);
    if (e) { console.log('' + e);
    } else { console.log('success'); }
  });
}
