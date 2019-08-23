// to run this script, use ts-node from the root directory:
// npx ts-node scripts/ligapvp.ts

// this script loads the data for liga pvp
// then generate matches for a cup

import * as fs from 'fs';
import {Player, Liga, Nivel, Rank, CupTable} from '../src/app/shared/ligapvp.module';


console.log('liga pvp script running');

const membros = Liga.getAllPlayers();
getMatches();
// saveToFile();

function getMatches() {
  const safira = Liga.getCountNivel(Nivel.Safira);
  const rubi = Liga.getCountNivel(Nivel.Rubi);
  const diamante = Liga.getCountNivel(Nivel.Diamante);
  const newbie = Liga.getCountNivel(Nivel.Newbie);

  // console.log(diamante);
  // console.log(rubi);
  // console.log(safira);
  // console.log(newbie);

  // const playersSafira = Liga.getPlayersOfNivel(Nivel.Safira);
  // console.log(playersSafira[5].getName());
  // const enemies = playersSafira[5].getEnemies(undefined, Rank.Silver);
  // const names = enemies.map((e) => e.getName());
  // console.log(names);

  const cup = new CupTable();
  cup.buildMatches();
  saveToFile(cup);
}

function saveToFile(cup: CupTable) {
  const logPath = './scripts/out/ligapvp-log.txt';
  const resultPath = './scripts/out/ligapvp-result.txt';
  // const json = JSON.stringify(membros);
  const log = cup.printLog();
  const result = cup.printMatches();
  fs.writeFile(logPath, log, 'utf8', e => {
    console.log('creating json: ' + logPath);
    if (e) {
      console.log('' + e);
    } else {
      console.log('success');
    }
  });
  fs.writeFile(resultPath, result, 'utf8', e => {
    console.log('creating json: ' + resultPath);
    if (e) {
      console.log('' + e);
    } else {
      console.log('success');
    }
  });
}
