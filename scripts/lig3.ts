// to run this script, use ts-node from the root directory:
// npx ts-node scripts/lig3.ts

// this script doesn't really do anything

import * as fs from 'fs';
import lig3Data from './vlig3.json';
import { count } from 'rxjs/operators';

console.log('test script running');

// buildMembers();
// const friendsMap = buildFriends();
// const friendsJson = mapToJson(friendsMap);

const ligJson = buildLig3();
saveToFile(ligJson);

function buildLig3() {
  console.log('lig3');
  interface Row {
    name: string;
    count: number;
    users: Array<string>;
  }
  const pokemap: Array<Row> = [];
  for (const [key, value] of Object.entries(lig3Data)) {
    let thisRow = pokemap.find(p => p.name === value);
    if (!thisRow) {
      thisRow = {
        name: value,
        count: 1,
        users: [key]
      };
      pokemap.push(thisRow);
   } else {
     thisRow.count++;
     thisRow.users.push(key);
   }
  }
  pokemap.sort((a, b) => b.count - a.count);
  console.log(pokemap);
  return pokemap;

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
