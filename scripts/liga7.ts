// to run this script, use ts-node from the root directory:
// npx ts-node scripts/update.ts

// this script loads the data for all pokémon from the gamemaster
// and writes a table easy to be used by the dex component at src/app/dex/dex.component.ts
// the table is used by the component to fill up the table component with data
// the table will contain each row and column just ready to be used and output to the screen
// the table is saved to src/app/dex/tableItems.ts

import * as fs from 'fs';
// import Pokemon, { Move } from '../src/app/shared/shared.module';
import { liga7 } from './vbattlesliga7';
import { Liga, Match } from '../src/app/shared/ligapvp.module';
import Pokemon from '../src/app/shared/shared.module';

console.log('update script running');
// let buffMoves: Move[] = [];

genLiga7();


function genLiga7() {
  const liga7string = liga7;
  const liga7lines = liga7string.split('\n');
  const liga7matches: Match[] = [];
  const teamMatches: Map<string, Match[]> = new Map();
  const team = 'skull';
  liga7lines.forEach(l => {
    const players = l.split(' x ');
    const p1 = Liga.getPlayerByName(players[0]);
    const p2 = Liga.getPlayerByName(players[1]);
    if (p1 && p2) {
      const newMatch = new Match(p1, p2);
      liga7matches.push(newMatch);
    }
  });
  liga7matches.forEach(m => {
    const teamPlayer = m.hasTeam(team);
    if (teamPlayer) {
      let matches = teamMatches.get(teamPlayer.getName());
      if (matches) { matches = matches.concat(m); } else { matches = [m]; }
      teamMatches.set(teamPlayer.getName(), matches);
    }

  });
  // console.log('liga7matches[10]');
  // console.log(teamMatches);

  printMatches(teamMatches);

}

function printMatches(teamMatches: Map<string, Match[]>) {
  console.log('liga7matches[10]');
  const keys = Array(teamMatches.keys());
  teamMatches.forEach((v, k) => {
    console.log(k);
    v.forEach(m => console.log(m.toString()));
  });
}

// function saveToFile() {
//   const path = './src/app/dex/tableItems.ts';
//   // const json = JSON.stringify(tableItems);
//   const filetext = 'export const ROWS = ' + json + ';';
//   fs.writeFile(path, filetext, 'utf8', (e) => {
//     console.log('creating json: ' + path);
//     if (e) { console.log('' + e);
//     } else { console.log('success'); }
//   });
// }
