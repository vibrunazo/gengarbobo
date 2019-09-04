exports.handler = function(event, context, callback) {
  // your server-side functionality
  const { name } = JSON.parse(event.body);
  const {identity, user} = context.clientContext;
  console.log('id:');
  console.log(identity);
  console.log('user:');
  console.log(user);
  console.log('event:');
  console.log(event);
  // console.log('context:');
  // console.log(context);


  callback(null, {
    "statusCode": 200,
    "headers": {
      "Access-Control-Allow-Origin": "*",
    },
    "body": JSON.stringify({msg: 'Hello ' + name}),
  });
}
