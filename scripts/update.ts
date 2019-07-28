// to run this script, use ts-node from the root directory:
// npx ts-node scripts/update.ts

// this script loads the data for all pokémon from the gamemaster
// and writes a table easy to be used by the dex component at src/app/dex/dex.component.ts
// the table is used by the component to fill up the table component with data
// the table will contain each row and column just ready to be used and output to the screen
// the table is saved to src/app/dex/tableItems.ts

import * as fs from 'fs';
import Pokemon from '../src/app/shared/shared.module';

console.log('update script running');
const tableItems = [];

genTableItems();
saveToFile();


function genTableItems() {
  const dex = Pokemon.dex;
  dex.forEach((p) => {
    const row = {
      name: p.speciesName,
      dex: p.dex,
      type: filterTypes(p.types),
      atk: p.baseStats.atk,
      def: p.baseStats.def,
      hp: p.baseStats.hp,
      fm: p.fastMoves,
      cm: p.chargedMoves,
      stats: Math.round(p.baseStats.atk * p.baseStats.def * p.baseStats.hp / 1000),
    };
    tableItems.push(row);
  });

  function filterTypes(types) {
    return types;
  }

}

function saveToFile() {
  const path = './src/app/dex/tableItems.ts';
  const json = JSON.stringify(tableItems);
  const filetext = 'export const ROWS = ' + json + ';';
  fs.writeFile(path, filetext, 'utf8', (e) => {
    console.log('creating json: ' + path);
    if (e) { console.log('' + e);
    } else { console.log('sucess'); }
  });
}
