import * as functions from 'firebase-functions';
import * as liga from './liga';
const admin = require('firebase-admin');
admin.initializeApp();
// const CREDENTIALS: string = process.env.GOOGLE_APPLICATION_CREDENTIALS!;
// const serviceAccount = require(CREDENTIALS);
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://gengarbobo.firebaseio.com"
// });
const db = admin.firestore();
const express = require('express');
const cors = require('cors');
// const cors = require('cors')({
//   origin: true,
// });
const app = express();


app.use(cors({ origin: true }));

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const authenticate = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    // res.status(403).send('Unauthorized');
    next();
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch(e) {
    // res.status(403).send('Unauthorized');
    next();
    return;
  }
};
app.use(authenticate);

app.post('/testFunc4', async (req, res) => {
  // const message = req.body.message;
  // const user = req.user;

  // console.log(`ANALYZING USER: `);
  // console.log(user);

  // await getMembers();
  // const code = members[0].code;
  const members = await liga.readMembers(db, req.user);
  const out = {
    msg: 'hello, thesse are all members',
    members
  }

  console.log('reading members 4 ');
  console.log(out);

  res.status(200).send(out);
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
  console.log('notherfunc2');

  // cors(request, response, () => {
    response.status(200).send("Another function response!!");
  // })
});
