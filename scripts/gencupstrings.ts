// to run this script, use ts-node from the root directory:
// npx ts-node scripts/gencupstrings.ts

// this script loads the data for all pokémon from the gamemaster
// and then writes a list of pokémon names that are eligible for PvP Cups
// these lists are used by PvPoke.com to generate rankings between only eligible pokémons
// the lists are saved to scripts/out/cups.json

import * as fs from 'fs';
import Pokemon from '../src/app/shared/shared.module';
import LEGENDARIES from '../src/app/shared/legendaries';
import LIGUINHA3 from '../src/app/shared/liguinha3';
import { log } from 'util';

console.log('update script running');
const cups = {
  kanto: {
    allowedList: []
  },
  johto: {
    allowedList: []
  },
  hoenn: {
    allowedList: [],
    bannedList: []
  },
  sinnoh: {
    allowedList: []
  },
  uc: {
    allowedList: [],
    bannedList: LEGENDARIES
  },
  liguinha3: {
    allowedList: []
  }
};

genTableItems();
saveToFile();

function genTableItems() {
  const dex = Pokemon.dex;
  let liguinha3 = 0;
  dex.forEach(p => {
    if (p.dex <= 151 && !p.speciesId.includes('alola')) {
      cups.kanto.allowedList.push(p.speciesId);
    }
    if (p.dex >= 152 && p.dex <= 251) {
      cups.johto.allowedList.push(p.speciesId);
    }
    if (p.dex >= 252 && p.dex <= 386 && p.speciesId !== 'jirachi') {
      cups.hoenn.allowedList.push(p.speciesId);
    }
    if (p.dex >= 387 && p.dex <= 493) {
      cups.sinnoh.allowedList.push(p.speciesId);
    }
    // if (!LEGENDARIES.includes(p.speciesId)) {
    //   cups.uc.allowedList.push(p.speciesId);
    // }
    if (LIGUINHA3.includes(p.dex) && p.speciesId !== 'persian') {
      cups.liguinha3.allowedList.push(p.speciesId);
      liguinha3++;
    }


  });
  console.log('liguinha3: ' + liguinha3);

  function filterTypes(types) {
    return types;
  }
}

function saveToFile() {
  const path = './scripts/out/cups.json';
  const json = JSON.stringify(cups);
  // const filetext = 'export const ROWS = ' + json + ';';
  fs.writeFile(path, json, 'utf8', e => {
    console.log('creating json: ' + path);
    if (e) {
      console.log('' + e);
    } else {
      console.log('success');
    }
  });
}
