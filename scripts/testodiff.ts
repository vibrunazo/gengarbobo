// to run this script, use ts-node from the root directory:
// npx ts-node scripts/testodiff.ts

// this script doesn't really do anything

import * as fs from 'fs';
import myData from './vdiffdata.json';

console.log('test script running');

// buildMembers();
// const friendsMap = buildFriends();
// const friendsJson = mapToJson(friendsMap);
// saveToFile(friendsJson);

const diff = diffObjs(myData.before, myData.after);
console.log(diff.diff);
if (Object.entries(diff.diff).length === 0) {
  console.log('no difference');
} else {
  console.log('yes difference');

}


function diffObjs(before: object, after: object): {diff: any, original: any} {
  const result = {
    diff: {},
    original: {}
  };
  console.log('diff data');
  const fields: Array<any> = Object.entries(after);
  console.log(fields[0]);
  fields.forEach(f => {
    const a = after[f[0]];
    const b = before[f[0]];
    const c = JSON.stringify(a) === JSON.stringify(b);

    if (!c) {
      result.diff[f[0]] = f[1];
      result.original[f[0]] = before[f[0]] || null;
    }

  });
  console.log(result);

  return result;
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
