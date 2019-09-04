const { MONGO_USER, MONGO_PSW, MONGO_URL } = process.env;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const MongoClient = require("mongodb").MongoClient;
  const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PSW}@${MONGO_URL}`;
  console.log("uri");
  console.log(uri);

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true
  }).catch(err => {
    console.log(err);
  });
  let collection;
  let res;
  if (!client) {
    return;
  }
  try {
    const db = client.db("ligapvp");
    let collection = db.collection("members");
    let query = { name: "vib" };
    res = await collection.findOne(query);

  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
  console.log(res);

  // await client.connect(err => {
  //   collection = client.db("ligapvp").collection("members");
  //   // console.log(client);
  //   // console.log(client.db("ligapvp"));

  //   // perform actions on the collection object
  //   // console.log('collection');
  //   // console.log(collection);

  //   collection.find({}).toArray(function(err, docs) {
  //     console.log("Found the following records");
  //     console.log(docs)
  //     // callback(docs);
  //   });

  //   client.close();
  // });

  return {
    statusCode: 200,
    body: "Mongo: " + res.code
  };
};
