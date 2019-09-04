const { MONGO_USER, MONGO_PSW, MONGO_URL } = process.env;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const MongoClient = require('mongodb').MongoClient;
  const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PSW}@${MONGO_URL}`;
  const client = new MongoClient(uri, { useNewUrlParser: true });
  let collection;
  await client.connect(err => {
    collection = client.db("ligapvp").collection("members");
    // perform actions on the collection object
    client.close();
  });
  console.log('collection');
  console.log(collection);


  return {
    statusCode: 200,
    body: "Hello, " + collection
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
