import { Member } from "./member.model";
import { Friendship } from "./friends.model";
import { ServerLog } from './serverLog.model';

// import { Player } from '../../src/app/shared/ligapvp.module';
//'../src/app/shared/ligapvp.module';

/**
 * Local cache of the members collection in the Firestore Database.
 * Call updateMembersCache() to update it.
 */
let membersCache: Array<Member> = [];

// let friendsCache: Map<string, Friendship> = new Map<string, Friendship>();
let logsCache = {};
let friendsCache = {};
let friendsCount = 0;
let db;
let rtdb;
export const allIds: string[] = [];

export function setDb(dbRef) {
  db = dbRef;
}
export function setRtDb(rtdbRef) {
  rtdb = rtdbRef;
}

export async function updateFriendsCache() {
  console.log('Fetching FRIENDS from database to write local cache.3');
  let resolve; let reject;
  const p = new Promise((res, rej) => {resolve = res; reject = rej;} );
  // const docRef = db.collection('friends').doc('agg');
  const docRef = rtdb.ref('/friends');
  docRef.once('value')
  .then(doc => {
    // fieldsToMap(doc.val());
    friendsCache = doc.val();
    resolve(friendsCache);
  })
  .catch(err => {
    reject(err);
  });

  return p;

  // function fieldsToMap(fields) {
  //   // console.log(fields);
  //   for (const [key, value] of Object.entries(fields)) {
  //     const fs: any = value;
  //     friendsCache.set(key, fs);
  //   }
  // }

}

/**
 * Returns all friends. Tries to read it from the local cache if it exists.
 * If not, reads it from the Firestore Database and saves to local cache before returning.
 */
export async function readFriends(): Promise<any> {
  console.log('was asked to read friends:');
  // console.log(members);
  let result: any;

  if (!friendsCache || Object.entries(friendsCache).length  === 0) {
    console.log('first time reading FRIENDS, building data');
    await updateFriendsCache();
  } else {
    // console.log('members already set when asked to read them');
  }
  result = friendsCache;

  return result;
}

export async function userWriteFriend(newFriends, user) {
  const friendsId = Object.entries(newFriends)[0][0];
  const friend1: Member | undefined = findMemberById( friendsId.slice(0, 5) );
  const friend2: Member | undefined = findMemberById( friendsId.slice(5, 10) );
  if (!friend1 || !friend2) { throw(new Error('could not find members by id ' + friendsId)); }
  try {
    const member = getMember(user);
    if (!member || (!canIwriteFriend(friend1, member) && !canIwriteFriend(friend2, member))) {
      throw(new Error('cannot write to friends ' + friendsId));
    }
    const result = await writeFriendsRT(newFriends, member.name);
    await updateFriendsCache();
    return result;
  } catch (e) {
    console.log(e);
    throw(e);
  }
}

function canIwriteFriend(friend: Member, member: Member): boolean {
  if (!member) { return false; }
  // if it's me
  if (member.name.toLowerCase() === friend.name.toLowerCase()) { return true; }
  if (!member.roles) { return false; }
  // if I am admin
  if (member.roles.includes('admin') || member.roles.includes('site')) { return true; }
  // if I am friends admin and he is from my team
  if (member.roles.includes('friends') && (member.team.toLowerCase() === friend.team.toLowerCase())) { return true; }
  return false;
}

function findMemberById(id: string): Member | undefined {
  return membersCache.find(m => m.id === id);
}

export async function checkWriteFriendsRT(newFriends, userName: string): Promise<ServerLog> {
  console.log('Checking writing friends to RTdb');
  await updateFriendsCache();
  const old = await readFriends();
  const diff = diffObjs(old, newFriends);
  const logMsg: ServerLog = {
    author: userName,
    body_new: diff.diff,
    body_old: diff.original,
    date: Date.now(),
    event: 'write',
    target: 'rtdb/friends'
  }
  return logMsg;
}

export async function writeFriendsRT(newFriends, userName: string): Promise<ServerLog> {
  console.log('writing friends to RTdb');

  await updateFriendsCache();
  const dbref = rtdb.ref('/friends')
  let resolve; let reject;
  const p:Promise<ServerLog> = new Promise((res, rej) => {resolve = res; reject = rej;});

  dbref.update(newFriends, async e => {
    if (e) { reject(e); }
    console.log('Finished writing friends to RTdb');
    const old = await readFriends();
    const diff = diffObjs(old, newFriends);
    const logMsg: ServerLog = {
      author: userName,
      body_new: diff.diff,
      body_old: diff.original,
      date: Date.now(),
      event: 'write',
      target: 'rtdb/friends'
    }
    // await writeLog(logMsg, {new: newFriends, old});
    await writeLog(logMsg);
    resolve(logMsg);
  });
  return p;
}

export async function writeFriends(newFriends: Map<string, Friendship>) {
  console.log('Writing friends to db');
  friendsCount = 0;
  let resolve; let reject;
  const p = new Promise((res, rej) => {resolve = res; reject = rej;});
  const friendData = {};
  try {
    newFriends.forEach((value, key, map) => addFriendship(key, value));
    // friendsCache = newFriends;
    console.log('Finished writing all friends, total: ' + friendsCount);
    await writeFriendsOnce();
    await updateFriendsCache();
    resolve();
  } catch (e) {
    reject(e);
  }
  return p;

  function addFriendship(id, friend) {
    const key = `${id}.s`;   // ex: rsscoachvib.s   meaning, the field 's' of Map called 'rsscoachvib';
    friendData[key] = friend.s;
    friendsCount++;
  }

  async function writeFriendsOnce() {
    const friendsRef = db.collection('friends');
    const docRef = friendsRef.doc('agg');
    console.log('Ill write friends here');
    let resolve2; let reject2;
    const p2 = new Promise((res, rej) => {resolve2 = res; reject2 = rej;});
    try {
      await docRef.update(friendData);
      resolve2();
    } catch (e) {
      reject2(e);
    }
    return p2;
  }
}

export async function clearFriends() {
  const collectionRef = db.collection('friends');
  const results: any[] = [];
  const p = new Promise(async (resolve, reject) => {
    await collectionRef.get()
    .then(async snap => {
      snap.docs.forEach(async doc => {
        const oldId = doc.id;
        if (oldId !== 'agg') {
          console.log('deleting: ' + doc.id);
          await doc.ref.delete();
        }
      });
    });
    resolve(results);
  });

  return p;
}

// async function writeFriend(id, friend: Friendship, db) {
//   const friendsRef = db.collection('friends');
//   const newDocRef = friendsRef.doc('agg');
//   let resolve; let reject;
//   const p = new Promise((res, rej) => {resolve = res; reject = rej;});
//   const key = `${id}.s`;   // ex: rsscoachvib.s   meaning, the field 's' of Map called 'rsscoachvib';
//   const friendData = {};
//   friendData[key] = friend.s;
//   try {
//     await newDocRef.update(friendData);
//     // let updateNested = db.collection('users').doc('Frank').update({
//     //   age: 13,
//     //   'favorites.color': 'Red'
//     // });
//     friendsCount++;
//     resolve();
//   } catch (e) {
//     reject(e);
//   }
//   return p;
// }

async function updateOneMemberToCache(member: Member): Promise<Member> {
  console.log('Fetching member ' + member.name + ' from database to local cache.');
  let resolve; let reject;
  const p: Promise<Member> = new Promise((res, rej) => {resolve = res; reject = rej;} );
  try {
    const collectionRef = db.collection('members');
    const docRef = collectionRef.doc(member.name.toLowerCase());
    docRef.get()
    .then(snap => {
      membersCache = membersCache.filter(m => m.name.toLowerCase() !== member.name.toLowerCase());
      membersCache.push(snap.data());
      console.log('Updated ' + member.name + ' on cache');
      resolve(snap);
    })
  } catch (e) {
    console.log(e);
    reject(e);
  }
  return p;
}

export async function writeTestLog(message: string) {
  const newLog: ServerLog = {
    author: 'vib',
    body_new: message,
    date: Date.now(),
    event: 'test',
  }
  return await writeLog(newLog);
}

export async function writeLog(logMsg: ServerLog, debug?) {
  // let resolve; let reject;
  // const p: Promise<any> = new Promise((res, rej) => {resolve = res; reject = rej;} );
  if (Object.entries(logMsg.body_new).length === 0 && logMsg.body_new.constructor === Object) {
    console.log('no difference writing to ' + logMsg.target);
    console.log(logMsg);
    console.log(debug);
    return 'failed to write log because there was no difference in the alledged update';
  }
  try {
    const logRef = rtdb.ref('/log/logs');
    const newChildRef = logRef.push();
    newChildRef.set(logMsg, e => {
      if (e) { throw(e); }
      console.log('Finished writing log');
    });
    return 'success';
  } catch (e) {
    console.log('error writing log:');
    console.log(logMsg);
    console.log(e);
    return 'failed writing log: ' + e;
  }
}

/**
 * Fetches members from the server and caches it locally on the 'membersCache' variable
 * @param db Reference to the Firestore Database from admin.firestore()
 */
export async function updateMembersCache() {
  const p = new Promise((resolve, reject) => {
    const membersRef = db.collection('members');
    membersRef.get()
    .then(snapshot => {
      membersCache = [];
      snapshot.forEach(doc => {
        // console.log(doc.id, '=>', doc.data());
        membersCache.push(doc.data());
      });
      resolve(membersCache);
      // console.log('members[0]');
      // console.log(members[0].code);
    })
    .catch(err => {
      reject(err);
      // console.log('Error getting documents', err);
    });
  });
  return p;
}

export function getUserRoles(user): Array<string> {
  let results: Array<string> = [];
  if (!user) { return results; }
  membersCache.forEach(m => {
    if (m.email === user.email) {
      if (m.roles) { results = [...m.roles]; }
      results.push('name:' + m.name.split('.').join('').toLowerCase())
      results.push('team:' + m.team.toLowerCase())
    }
  });
  return results;
}

/**
 * Will try to write this member to the Firestore Database, if this User has permission to do so.
 * Returns the same member after being written and after being read again from the database. So you can
 * check if the write succeeded.
 * @param newMember Member to write to Firestore
 * @param db Reference to the Firestore Database from admin.firestore()
 * @param user Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
export async function userUpdatesMember(newMember, user): Promise<Member> {
  let resolve; let reject;
  const p: Promise<Member> = new Promise((res, rej) => {resolve = res; reject = rej;} );
  let result: Member;
  const reqMember = getMember(user);
  if (!reqMember) {
    console.log('nope, not a member');
    reject('not a member');
    return p;
  }
  console.log("I think he's a member");
  try {
    await writeMember(newMember, reqMember.name.toLowerCase());
    result = await updateOneMemberToCache(newMember);
    resolve(result);
  } catch (e) {
    reject(e);
  }
  return p;
}

export async function readLog(user) {
  await getLogsFromDb(user);
  const allLogs: ServerLog[] = Object.values(logsCache);
  return allLogs;
  // const result: string[] = [];
  // allLogs.forEach(l => {
  //   result.push(readLogLine(l));
  // });
  // return result;
}

// function readLogLine(log: ServerLog): string {
//   let result = '';
//   const date: Date = new Date(log.date);
//   const dateStr = date.toLocaleString();
//   let msg = '';
//   if  (log.target === 'rtdb/friends') {
//     const allFriends: string[] = Object.keys(log.body_new);
//     const slice = allFriends.slice(0, 3);
//     msg = `${slice.toString()} e ${allFriends.length - slice.length} outros`
//   }
//   result = `${dateStr}: ${log.author} wrote to ${log.target}: ${msg}`;
//   return result;
// }

export async function getLogsFromDb(user) {
  console.log('Fetching LOGS from RT database to write local cache.');
  let resolve; let reject;
  const p = new Promise((res, rej) => {resolve = res; reject = rej;} );
  const docRef = rtdb.ref('/log/logs');
  docRef.once('value')
  .then(doc => {
    logsCache = doc.val();
    resolve(logsCache);
  })
  .catch(err => {
    reject(err);
  });

  return p;
}

export async function readOneMember(memberName: string): Promise<Member | undefined> {
  try {
    if (membersCache.length === 0) {
      console.log('ReadOneMember: first time reading members, building data');
      await updateMembersCache();
    }
    return membersCache.find(m => m.name === memberName);
  } catch (e) {throw(e);}
}


/**
 * Returns all members with only the fields that this 'user' has permission to view.
 * Tries to read it from local cache if it exists. Else will read it from the Firestore Database then save it to local cache.
 * @param db Reference to the Firestore Database from admin.firestore()
 * @param user Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
export async function readMembers(user): Promise<Member[]> {
  // console.log('was asked to read members:');
  // console.log(members);
  let result: Member[] = [];

  if (membersCache.length === 0) {
    console.log('first time reading members, building data');
    await updateMembersCache();
  } else {
    // console.log('members already set when asked to read them');
  }
  if (isMember(user)) {
    console.log("I think he's a member");
    result = filterDeleted(membersCache);
  } else {
    console.log('nope, not a member');
    result = censorSecrets(filterDeleted(membersCache));
  }

  return result;
}

/**
 * Returns a new array of members without the members that have state = 'deleted'
 * @param members members to filter
 */
export function filterDeleted(members: Member[]): Member[] {
  return members.filter(m => m.state !== 'deleted');
}

/**
 * Reads the global variable 'members' and returns a copy that has only the fields that are public
 */
function censorSecrets(members: Member[]): Member[] {
  let result: Member[] = members;
  result = members.map(p => { return {
    name: p.name,
    team: p.team,
    winrate: p.winrate,
    rank: p.rank,
    badges: (+p.badges!! || 0),
    medals: (+p.medals!! || 0),
    id: p.id,
    state: p.state
  }});
  return result;
}

/**
 * Returns true if this user is a member, false if not.
 * Check is done by comparing the user.email to the email of all members in the database
 * @param user Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
function isMember(user): boolean {
  console.log('checking membership');
  console.log(user);

  if (!user || !user.email) { return false; }
  let result = false;
  const member = membersCache.find(m => m.email === user.email);
  if (member) { result = true; }
  return result;
}

/**
 * Returns the Member associated with this Firebase User.
 * Check is done by comparing the user.email to the email of all members in the database
 * Returns undefined if not a member
 * @param user Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
function getMember(user): Member | undefined {
  if (!user || !user.email) { return undefined; }
  const member = membersCache.find(m => m.email === user.email);
  return member;
}

/**
 *
 * @param db Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
export function updateDatabase() {
  const newMember1 = {
    name: 'haakaishin',
    team: 'flare',
    winrate: 78
  }
  const newMember2 = {
    name: 'VanEdipo',
    team: 'plasma',
  }
  const results: any[] = [];
  const p = new Promise(async (resolve, reject) => {
    try {
      let result;
      result = await writeMember(newMember1, 'dbtest');
      results.push(result);
      result = await writeMember(newMember2, 'dbtest');
      results.push(result);
      resolve(results);
    } catch (e) {
      reject(e);
    }
  });
  return p;
}

/**
 * Writes all members from the array to the database. When done, updates the local cache.
 * @param memberList Array of members to write to the database
 * @param db Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
export async function writeMembers(memberList: Member[], userName: string) {
  console.log('Writing list of members to database.');
  const results: any[] = [];
  let result;
  await findDeletedMembers(memberList);
  const p = new Promise(async (resolve, reject) => {
    try {
      for (const member of memberList) {
        result = await writeMember(member, userName);
        results.push(result);
      }
      await updateMembersCache();
      resolve(results)
    } catch (e) {
      reject(e);
    }
  });
  return p;
}
/**
 * Checking what would happen if I were to write all members from the array to the database.
 * @param memberList Array of members to write to the database
 */
export async function checkWriteMembers(memberList: Member[], userName: string): Promise<ServerLog[]> {
  console.log('Checking writing list of members to database.');
  const results: ServerLog[] = [];
  let result: ServerLog;
  await findDeletedMembers(memberList);
  const p: Promise<ServerLog[]> = new Promise(async (resolve, reject) => {
    try {
      for (const member of memberList) {
        // member.exists = false;
        // member.badges = 999;
        result = await checkWriteMember(member, userName);
        if (result.body_new && Object.keys(result.body_new).length > 0) {
          results.push(result);
        }
      }
      resolve(results)
    } catch (e) {
      reject(e);
    }
  });
  return p;
}

async function findDeletedMembers(newMembers: Member[]) {
  await readMembers(null);
  membersCache.forEach(m => {
    const oldname = m.name.toLowerCase();
    const some = newMembers.some(n => n.name.toLowerCase() === oldname)
    if (!some) {

      const newMember: Member = JSON.parse(JSON.stringify(m));
      newMember.state = `deleted`;
      newMembers.push(newMember);
    }
  })
}

/**
 * Checks what would happen if I were to write this one member to the Firestore Database. Uses its lowerCased name as the ID.
 * @param member Member to write to the database
 */
export async function checkWriteMember(member: Member, userName: string): Promise<ServerLog> {
  const id = member.name.toLowerCase().trim();
  const p: Promise<ServerLog> = new Promise(async (resolve, reject) => {
    try {
      const old = await readOneMember(member.name);
      if (old && old.id && old.id) {
        if (!allIds.includes(old.id)) { allIds.push(old.id); }
      } else {
        member.id = genNewID(member);
      }
      const diff = diffObjs(old, member);
      const newLog: ServerLog = {
        author: userName,
        body_new: diff.diff,
        body_old: diff.original,
        date: Date.now(),
        event: 'write',
        target: 'fsdb/members/' + id,
      }
      resolve(newLog);
    } catch (e) {
      reject(e);
    }
  });
  return p;
}

/**
 * Writes one member to the Firestore Database. Uses its lowerCased name as the ID.
 * @param member Member to write to the database
 * @param db Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
export async function writeMember(member: Member, userName: string) {
  const membersRef = db.collection('members');
  const id = member.name.toLowerCase().trim();
  const newDocRef = membersRef.doc(id);
  const p = new Promise(async (resolve, reject) => {
    try {
      const old = await readOneMember(member.name);
      if (old && old.id) {
        if (!allIds.includes(old.id)) { allIds.push(old.id); }
      } else {
        member.id = genNewID(member);
      }
      const result = await newDocRef.set(member, {merge: true});
      const diff = diffObjs(old, member);
      const newLog: ServerLog = {
        author: userName,
        body_new: diff.diff,
        body_old: diff.original,
        date: Date.now(),
        event: 'write',
        target: 'fsdb/members/' + id,
      }
      await writeLog(newLog);
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
  return p;
}


function genNewID(member: Member): string {
  const newId = genIdFromName(member.name);

  return newId;

  function genIdFromName(name: string, i = 1): string {
    let id = name.padEnd(5, '0').slice(0, 5).toLowerCase();
    if (i > 1) {
      const end = i.toString();
      const len = end.length;
      const start = id.slice(0, 5 - len);
      id = start + end;
      console.log('id now');
      console.log(id);

    }
    if (allIds.includes(id)) {
      console.log('id exists ' + id + ' i:' + i);
      id = genIdFromName(name, i + 1);
    }
    allIds.push(id);
    return id;
  }
}

/**
 * Rewrites all documents from the 'members' collection with their 'name' as their id.
 * Deletes all documents whose ids is not their names
 * @param db Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
export async function rewriteAllMembers() {
  const membersRef = db.collection('members');
  const results: any[] = [];
  const p = new Promise(async (resolve, reject) => {
    await membersRef.get()
    .then(async snap => {
      snap.docs.forEach(async doc => {
        const name: string = doc.data().name.toLowerCase();
        const newDocRef = membersRef.doc(name);
        const newMember = doc.data();
        const oldId = doc.id;
        const result = await newDocRef.set(newMember, {merge: true});
        results.push(result);
        if (oldId !== name) {
          console.log('deleting: ' + doc.id);
          await doc.ref.delete();
        }
      });
    });
    resolve(results);
  });

  return p;

}

/**
 * Compares 2 objects and returns the diff between them.
 * Return object has 'diff' field containing only the values that changed.
 * And a 'original' field containing only the fields that changed with their original values
 * @param before object before change
 * @param after object after change
 */
function diffObjs(before: object| undefined, after: object | undefined): {diff: any, original: any} {
  const result = {
    diff: {},
    original: {}
  };
  if (!before && after) { result.diff = after; return result; }
  if (!before) { return result; }
  if (!after) { result.original = before; result.diff = { state: 'deleted' }; return result; }
  // if (!after || !before) { return result; }
  const fields: Array<any> = Object.entries(after);
  fields.forEach(f => {      // for each field on 'after'
    const a = after[f[0]];   // value of that field on 'after'
    const b = before[f[0]];  // value of that field on 'before'
    const c = JSON.stringify(a) === JSON.stringify(b); // are they equal? stringified so I can compare arrays
    if (!c) {                                       // if not
      result.diff[f[0]] = f[1];                     // then add the value changed to the return 'diff'
      result.original[f[0]] = before[f[0]] || null; // and add the value before change to return 'original'
    }
  });
    // console.log('on cat');
    // console.log(result);
    // console.log('before: ');
    // console.log(before['123catbond13jcruel13']);
    // console.log('after ');
    // console.log(after['123catbond13jcruel13']);
    // console.log('before: ');
    // console.log(before['123catbondc4i00']);
    // console.log('after ');
    // console.log(after['123catbondc4i00']);


  return result;
}
