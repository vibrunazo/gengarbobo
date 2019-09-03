exports.handler = function(event, context, callback) {
  // your server-side functionality
  const { name } = JSON.parse(event.body);
  const {identity, user} = context.clientContext;
  console.log('id, user:');
  console.log(identity);
  console.log(user);


  callback(null, {
    "statusCode": 200,
    "headers": {
      "Access-Control-Allow-Origin": "*",
    },
    "body": JSON.stringify({msg: 'Hello ' + name}),
  });
}
