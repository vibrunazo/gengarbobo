import * as functions from 'firebase-functions';
import * as liga from './liga';
import * as sheetsReader from './sheets';
import { Member } from './member.model';
import { ServerLog } from './serverLog.model';
// import { Friendship } from './friends.model';
const admin = require('firebase-admin');
admin.initializeApp();
// const CREDENTIALS: string = process.env.GOOGLE_APPLICATION_CREDENTIALS!;
// const serviceAccount = require(CREDENTIALS);
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://gengarbobo.firebaseio.com"
// });
const {OAuth2Client} = require('google-auth-library');
// const {google} = require('googleapis');

const CONFIG_CLIENT_ID = functions.config().googleapi.client_id;
const CONFIG_CLIENT_SECRET = functions.config().googleapi.client_secret;
// const CONFIG_SHEET_ID = functions.config().googleapi.sheet_id;
const db = admin.firestore();
liga.setDb(db);
const rtdb = admin.database();
liga.setRtDb(rtdb);
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
  // const members = await liga.readMembers(db, req.user);
  await liga.clearFriends();
  const out = {
    msg: 'hello, cleared all friends',
  }

  res.status(200).send(out);
});
app.post('/testFunc5', async (req, res) => {
  // const members = await liga.readMembers(db, req.user);

  const writeResult = await liga.updateDatabase();
  // const writeResult = await liga.rewriteAllMembers(db);
  const out = {
    msg: 'hello, writing to db 6',
    writeResult
  }
  console.log('writing members 6');
  console.log(out);

  res.status(200).send(out);
});

app.post('/updateFriend', async (req, res) => {
  let result;
  const newFriend = req.body.friend;
  const user = req.user;
  console.log('updating friend');
  console.log(req.body);

  try {
    result = await liga.userWriteFriend(newFriend, user);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
    return;
  }
  const out = {
    msg: 'Wrote friend',
    result,
  }
  res.status(200).send(out);
});

app.post('/updateMember', async (req, res) => {
  let result;
  const member = req.body.member;
  const user = req.user;
  console.log('updating member');
  console.log(req.body);

  try {
    result = await liga.userUpdatesMember(member, user);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
    return;
  }
  const out = {
    msg: 'Wrote member',
    result,
  }
  res.status(200).send(out);
});


app.post('/forceCacheUpdate', async (req, res) => {
  console.log('Forcing Cache update 2');
  if (isDebug(req)) {
    await liga.updateMembersCache();
    await liga.updateFriendsCache();
    const out = {
      msg: 'updated members and friends cache',
    }
    res.status(200).send(out);
  } else {
    res.status(400).send('Forbidden');
  }
});

app.post('/writeLog', async (req, res) => {
  console.log('Writing to log');
  if (!isDebug(req)) {
    res.status(400).send('Forbidden');
    return;
  }
  try {
    await liga.writeLog(req.body.msg);
    const out = {
      msg: 'updated log',
    }
    res.status(200).send(out);
  } catch (e) {
    console.log('error writing to log');
    console.log(e);
    res.status(400).send({e});
  }
});

app.get('/getAllMembers', async (req, res) => {
  const members = await liga.readMembers(req.user);
  const roles = liga.getUserRoles(req.user);
  const out = {
    msg: 'hello, these are all members',
    roles,
    members,
  }
  res.status(200).send(out);
});

app.get('/getAllFriends', async (req, res) => {
  const friends = await liga.readFriends();
  const out = {
    msg: 'hello, thesse are all Friends',
    friends,
  }
  res.status(200).send(out);
});

app.post('/driveUpdate', async (req, res) => {
  let rowsMembros;
  let rowsEquipes;
  let newMembers: Member[] = [];
  const client = await sheetsReader.getClient(getAuthorizedClient);
  try {
    rowsMembros = await sheetsReader.readMembrosRows(client);
    rowsEquipes = await sheetsReader.readEquipesRows(client);
    newMembers = sheetsReader.getMembersFromRows(rowsMembros);
    sheetsReader.setMemberParamsFromEquipesRows(rowsEquipes, newMembers);
    await liga.writeMembers(newMembers, 'drivesheet');

    good();
  } catch (e) {
    bad(e);
  }

  function bad(e) {
    console.log(e);
    res.status(400).send(e);
  }
  function good() {
    const out = {
      msg: 'Drive update 9',
      newMembers,
      // rowsEquipes
    }
    res.status(200).send(out)
  }
});

app.post('/driveUpdateFriends', async (req, res) => {
  let rowsFriends: string[][] = [];
  let newFriendsMap;
  let newFriendsJSON;
  let size;
  let log: ServerLog;
  const client = await sheetsReader.getClient(getAuthorizedClient);
  try {
    const members = await liga.readMembers(null);
    rowsFriends = await sheetsReader.readAmizadesRows(client);
    newFriendsMap = sheetsReader.getFriendsFromRows(rowsFriends, members);
    size = newFriendsMap.size;
    newFriendsJSON = mapToJson(newFriendsMap);
    // await liga.writeFriends(newFriendsMap, db);
    log = await liga.writeFriendsRT(newFriendsJSON, 'drivesheets');
    good();
  } catch (e) {
    bad(e);
  }

  function bad(e) {
    console.log(e);
    res.status(400).send(e);
  }
  function good() {
    const out = {
      msg: 'Drive Friends update 3',
      size,
      log,
      newFriends: newFriendsJSON,
    }
    res.status(200).send(out)
  }
});

// Expose the API as a function
exports.api = functions.https.onRequest(app);

export const anotherFunction = functions.https.onRequest((request, response) => {
  console.log('notherfunc2');

  // cors(request, response, () => {
    response.status(200).send("Another function response!!");
  // })
});

// The OAuth Callback Redirect.
// const FUNCTIONS_REDIRECT = `https://gengarbobo.firebaseapp.com/oauthcallback`;
const FUNCTIONS_REDIRECT = `https://us-central1-gengarbobo.cloudfunctions.net/oauthcallback`;

// setup for authGoogleAPI
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const functionsOauthClient = new OAuth2Client(CONFIG_CLIENT_ID, CONFIG_CLIENT_SECRET,
  FUNCTIONS_REDIRECT);

// OAuth token cached locally.
let oauthTokens = null;

// visit the URL for this Function to request tokens
exports.authgoogleapi = functions.https.onRequest((req, res) => {
  res.set('Cache-Control', 'private, max-age=0, s-maxage=0');
  // console.log(functionsOauthClient);
  const url = functionsOauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  console.log('url');
  console.log(url);
  res.redirect(url);
})

// setup for OauthCallback
const DB_TOKEN_PATH = '/api_tokens';

// after you grant access, you will be redirected to the URL for this Function
// this Function stores the tokens to your Firebase database
exports.oauthcallback = functions.https.onRequest(async (req, res) => {
  res.set('Cache-Control', 'private, max-age=0, s-maxage=0');
  const code = req.query.code;
  try {
    const {tokens} = await functionsOauthClient.getToken(code);
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    console.log('tokens:');
    console.log(tokens);

    await admin.database().ref(DB_TOKEN_PATH).set(tokens);
    return res.status(200).send('App successfully configured with new Credentials. '
        + 'You can now close this page.');
  } catch (error) {
    return res.status(400).send(error);
  }
});

// checks if oauthTokens have been loaded into memory, and if not, retrieves them
async function getAuthorizedClient() {
  if (oauthTokens) {
    return functionsOauthClient;
  }
  const snapshot = await admin.database().ref(DB_TOKEN_PATH).once('value');
  oauthTokens = snapshot.val();
  // console.log('token:');
  // console.log(oauthTokens);

  functionsOauthClient.setCredentials(oauthTokens);
  return functionsOauthClient;
}

/**
 * Converts a Map to Json object that can be put on the server response to the client
 * @param map A map to convert to Json
 */
function mapToJson(map: Map<string, any>) {
  const result = {};
  for (const i of map) {
    const k = i[0]; const v = i[1];
    result[k] = v;
    // result[n].push(k);
  }
  return result;
}
function isDebug(req) {
  return (req.body.psw === functions.config().debug.psw);
}
