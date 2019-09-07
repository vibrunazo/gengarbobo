import * as functions from 'firebase-functions';
// const cors = require('cors')({
  //   origin: true,
  // });
const admin = require('firebase-admin');
// admin.initializeApp();
const CREDENTIALS: string = process.env.GOOGLE_APPLICATION_CREDENTIALS!;
const serviceAccount = require(CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gengarbobo.firebaseio.com"
});
const db = admin.firestore();
// const doc = db.collection('some/otherdoc')
const express = require('express');
const cors = require('cors');
const app = express();

const members = [] as any;
function getMembers() {
  const membersRef = db.collection('members');

  membersRef.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        members.push(doc.data());
      });
      console.log('members[0]');
      console.log(members[0].code);

    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
}


app.use(cors({ origin: true }));

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const authenticate = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch(e) {
    res.status(403).send('Unauthorized');
    return;
  }
};

app.use(authenticate);
// Automatically allow cross-origin requests

app.post('/testFunc4', async (req, res) => {
  // const message = req.body.message;
  // const user = req.user;

  // console.log(`ANALYZING USER: `);
  // console.log(user);

  getMembers();
  // res.status(200).send("Hello from Firebase4!");

});

// Expose the API as a function
exports.api = functions.https.onRequest(app);

// export const helloWorld = functions.https.onRequest((request, response) => {
//   cors(request, response, () => {
//     // const idToken = request.headers.authorization.split('Bearer ')[1];
//     const idToken = request.headers.authorization;
//     console.log('called hello world3');
//     console.log(idToken);

//     response.status(200).send("Hello from Firebase3!");
//   })
// });

export const anotherFunction = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    response.status(200).send("Another function response!!");
  })
});
