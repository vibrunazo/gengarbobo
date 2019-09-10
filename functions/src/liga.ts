import { Member } from "./member.model";

// import { Player } from '../../src/app/shared/ligapvp.module';
//'../src/app/shared/ligapvp.module';

/**
 * Local cache of the members collection in the Firestore Database.
 * Call updateMembersCache() to update it.
 */
const membersCache: Array<any> = [];

/**
 * Fetches members from the server and caches it locally on the 'membersCache' variable
 * @param db Reference to the Firestore Database from admin.firestore()
 */
async function updateMembersCache(db) {
  console.log('Fetching members from database to write local cache.');
  const p = new Promise((resolve, reject) => {
    const membersRef = db.collection('members');
    membersRef.get()
    .then(snapshot => {
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

/**
 * Tries to read the members from the database 'db' returns only what this 'user' has permission to view
 * @param db Reference to the Firestore Database from admin.firestore()
 * @param user Reference to the Firebase Auth User that was recorded on req.user by the middleware
 */
export async function readMembers(db, user) {
  // console.log('was asked to read members:');
  // console.log(members);
  let result: any[] = [];

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
    rank: p.rank
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
    winrate: '78'
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
    } catch (e) {
      resolve(e);
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
