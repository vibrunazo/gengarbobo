import { Member } from "./member.model";
import { Friendship } from "./friends.model";

// import { Player } from '../../src/app/shared/ligapvp.module';
//'../src/app/shared/ligapvp.module';

/**
 * Local cache of the members collection in the Firestore Database.
 * Call updateMembersCache() to update it.
 */
let membersCache: Array<Member> = [];

// let friendsCache: Map<string, Friendship> = new Map<string, Friendship>();
let friendsCache = {};
let friendsCount = 0;

async function updateFriendsCache(db) {
  console.log('Fetching FRIENDS from database to write local cache.3');
  let resolve; let reject;
  const p = new Promise((res, rej) => {resolve = res; reject = rej;} );
  // const docRef = db.collection('friends').doc('agg');
  const docRef = db.ref('/friends');
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
 * @param db Reference to the Firestore Database from admin.firestore()
 */
export async function readFriends(db): Promise<any> {
  console.log('was asked to read friends:');
  // console.log(members);
  let result: any;

  if (Object.entries(friendsCache).length  === 0) {
    console.log('first time reading FRIENDS, building data');
    await updateFriendsCache(db);
  } else {
    // console.log('members already set when asked to read them');
  }
  result = friendsCache;

  return result;
}

export async function writeFriendsRT(newFriends, db) {
  console.log('writin friends to RTdb');

  const dbref = db.ref('/friends')
  let resolve; let reject;
  const p = new Promise((res, rej) => {resolve = res; reject = rej;});
  dbref.update(newFriends, e => {
    if (e) { reject(e); }
    console.log('Finished writing');
    resolve();
  });
  return p;
}

export async function writeFriends(newFriends: Map<string, Friendship>, db) {
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
    await updateFriendsCache(db);
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

export async function clearFriends(db) {
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

async function updateOneMemberToCache(member: Member, db): Promise<Member> {
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

/**
 * Fetches members from the server and caches it locally on the 'membersCache' variable
 * @param db Reference to the Firestore Database from admin.firestore()
 */
export async function updateMembersCache(db) {
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

export function getUserRoles(db, user): Array<string> {
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
export async function userUpdatesMember(newMember, db, user): Promise<Member> {
  let resolve; let reject;
  const p: Promise<Member> = new Promise((res, rej) => {resolve = res; reject = rej;} );
  let result: Member;
  if (!isMember(user)) {
    console.log('nope, not a member');
    reject('not a member');
    return p;
  }
  console.log("I think he's a member");
  try {
    await writeMember(newMember, db);
    result = await updateOneMemberToCache(newMember, db);
    resolve(result);
  } catch (e) {
    reject(e);
  }
  return p;
}


/**
 * Returns all members with only the fields that this 'user' has permission to view.
 * Tries to read it from local cache if it exists. Else will read it from the Firestore Database then save it to local cache.
 * @param db Reference to the Firestore Database from admin.firestore()
 * @param user Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
export async function readMembers(db, user): Promise<Member[]> {
  // console.log('was asked to read members:');
  // console.log(members);
  let result: Member[] = [];

  if (membersCache.length === 0) {
    console.log('first time reading members, building data');
    await updateMembersCache(db);
  } else {
    // console.log('members already set when asked to read them');
  }
  if (isMember(user)) {
    console.log("I think he's a member");
    result = membersCache;
  } else {
    console.log('nope, not a member');
    result = censorSecrets();
  }

  return result;
}

/**
 * Reads the global variable 'members' and returns a copy that has only the fields that are public
 */
function censorSecrets(): any[] {
  let result: any[] = membersCache;
  result = membersCache.map(p => { return {
    name: p.name,
    team: p.team,
    winrate: p.winrate,
    rank: p.rank,
    badges: p.badges,
    medals: p.medals
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
 *
 * @param db Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
export function updateDatabase(db) {
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
      result = await writeMember(newMember1, db);
      results.push(result);
      result = await writeMember(newMember2, db);
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
export async function writeMembers(memberList: Member[], db) {
  console.log('Writing list of members to database.');
  const results: any[] = [];
  let result;
  const p = new Promise(async (resolve, reject) => {
    try {
      for (const member of memberList) {
        result = await writeMember(member, db);
        results.push(result);
      }
      await updateMembersCache(db);
      resolve(results)
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
export async function writeMember(member: Member, db) {
  const membersRef = db.collection('members');
  const id = member.name.toLowerCase().trim();
  const newDocRef = membersRef.doc(id);
  const p = new Promise(async (resolve, reject) => {
    try {
      const result = await newDocRef.set(member, {merge: true});
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
  return p;
}

/**
 * Rewrites all documents from the 'members' collection with their 'name' as their id.
 * Deletes all documents whose ids is not their names
 * @param db Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
export async function rewriteAllMembers(db) {
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
