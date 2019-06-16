
// import { Pokemon } from "../shared/shared.module";

/// <reference lib="webworker" />
// import pk, { Pokemon } from '../shared/shared.module';
import { Pokemon, Move } from '../shared/shared.module';

addEventListener('message', ({ data }) => {
  const response = `worker response to ${data.m}`;
  const allwins = calculateAllWins(data.pks, data.fm);
  // test();
  postMessage(allwins);


});

// self.importScripts('foo.js');

// import { Pokemon } from '../shared/shared.module';

// function test() {
//   let list = pk.getFullList();
//   console.log(list);

// }

function calculateAllWins(pks: Pokemon[], fm: Move): number[] {
  // let moo = Pokemon.getFullList();
  // console.log(fm);

  const allwins = [];
  for (let i = 0; i < pks.length; i++) {
    const wins = calculateWins(i, pks, fm);
    allwins.push(wins);
  }
  // console.log(`wins: `);
  // console.log(allwins);
  return allwins;
}

// // calculates how many wins the pokémon with this IV combination has against all other combinations
function calculateWins(index: number, pks: Pokemon[], fm: Move): number {
  let wins = 0;
  let p1 = pks[index];
  // let p2 = this.pks[0];

  for (const p2 of pks) {
    let d = Pokemon.getFmDuel(p1, fm, p2, fm);
    d = Math.min(d, 1);
    d = Math.max(d, -1);
    wins += d;
    // console.log(p2);
  }

  return wins;
}
