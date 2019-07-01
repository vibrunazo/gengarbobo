
// import { Pokemon } from "../shared/shared.module";

/// <reference lib="webworker" />
// import pk, { Pokemon } from '../shared/shared.module';
import { Pokemon, Move } from '../shared/shared.module';

// Results is a group of wins, losses and their sum. For one pokémon on the table against all other pokémon on the table
// each pokémon row has their own Results
// the final message sent by this worker will be an array of Results, one for each row
interface Results {
  wins: number;
  losses: number;
  sum: number;
}

addEventListener('message', ({ data }) => {
  // const response = `worker response to ${data.m}`;
  const allresults = calculateAllWins(data.pks, data.fm);
  // test();
  postMessage(allresults);


});

// self.importScripts('foo.js');

// import { Pokemon } from '../shared/shared.module';

// function test() {
//   let list = pk.getFullList();
//   console.log(list);

// }


function calculateAllWins(pks: Pokemon[], fm: Move): Results[] {
  // let moo = Pokemon.getFullList();
  // console.log(fm);

  const allResults = [];
  for (let i = 0; i < pks.length; i++) {
    const results = calculateWins(i, pks, fm);
    allResults.push(results);
  }
  // console.log(`wins: `);
  // console.log(allwins);
  return allResults;
}

// calculates how many wins the pokémon with this IV combination has against all other combinations
function calculateWins(index: number, pks: Pokemon[], fm: Move): Results {
  let wins = 0;
  let losses = 0;
  let sum = 0;
  const p1 = pks[index];
  // let p2 = this.pks[0];

  for (const p2 of pks) {
    let d = Pokemon.getFmDuel(p1, fm, p2, fm);
    if (d > 0) { wins++; }
    if (d < 0) { losses++; }
    d = Math.min(d, 1);
    d = Math.max(d, -1);
    sum += d;
    // console.log(p2);
  }

  const results = {
    wins,
    losses,
    sum,
  };

  return results;
}
