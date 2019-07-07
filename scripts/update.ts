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
      type: p.types,
      atk: p.baseStats.atk,
      def: p.baseStats.def,
      hp: p.baseStats.hp,
      fm: p.fastMoves,
      cm: p.chargedMoves,
    };
    tableItems.push(row);
  });

}

function saveToFile() {
  const path = './src/app/dex/tableItems.ts';
  const json = JSON.stringify(tableItems);
  const filetext = 'export const ROWS = ' + json + ';';
  fs.writeFile(path, filetext, 'utf8', () => console.log('created json: ' + path));
}
