const { MONGO_USER, MONGO_PSW, MONGO_URL } = process.env;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const {identity, user} = context.clientContext;
  const MongoClient = require('mongodb').MongoClient;
  const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PSW}@${MONGO_URL}`;
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true
  }).catch(err => {
    console.log(err);
  });
  let collection;
  let res = 'not found';
  if (!client) {
    return;
  }
  try {
    const db = client.db("ligapvp");
    let collection = db.collection("members");
    let query = { email: user.email };
    res = await collection.findOne(query);

  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
  console.log(res);

  return {
    statusCode: 200,
    body: "code, " + res
  };


};

// exports.handler = function(event, context, callback) {
//   // your server-side functionality
//   const { name } = JSON.parse(event.body);
//   const {identity, user} = context.clientContext;
//   console.log('id:');
//   console.log(identity);
//   console.log('user:');
//   console.log(user);
//   // console.log('event:');
//   // console.log(event);
//   // console.log('context:');
//   // console.log(context);

//   callback(null, {
//     "statusCode": 200,
//     "headers": {
//       "Access-Control-Allow-Origin": "*",
//     },
//     "body": JSON.stringify({msg: 'Hello ' + name}),
//   });
// }
