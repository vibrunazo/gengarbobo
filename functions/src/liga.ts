// import { Player } from '../../src/app/shared/ligapvp.module';
//'../src/app/shared/ligapvp.module';

const members: Array<any> = [];
async function getMembers(db) {
  // console.log('fetching members from database');
  const p = new Promise((resolve, reject) => {
    const membersRef = db.collection('members');
    membersRef.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        // console.log(doc.id, '=>', doc.data());
        members.push(doc.data());
      });
      resolve(members);
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

// tries to read the members from the database 'db' returns only what this 'user' has permission to view
export async function readMembers(db, user) {
  // console.log('was asked to read members:');
  // console.log(members);
  let result: any[] = [];

  if (members.length === 0) {
    console.log('first time reading members, building data');
    await getMembers(db);
  } else {
    // console.log('members already set when asked to read them');
  }
  if (isMember(user)) {
    console.log("I think he's a member");
    result = members;
  } else {
    console.log('nope, not a member');
    result = censorSecrets();
  }

  return result;
}

function censorSecrets(): any[] {
  let result: any[] = members;
  result = members.map(p => { return {
    name: p.name,
    team: p.team,
    winrate: p.winrate,
    rank: p.rank
  }});
  return result;
}

function isMember(user): boolean {
  console.log('checking membership');
  console.log(user);

  if (!user || !user.email) { return false; }
  let result = false;
  const member = members.find(m => m.email === user.email);
  if (member) { result = true; }
  return result;
}
