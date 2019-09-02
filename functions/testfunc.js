exports.handler = function(event, context, callback) {
  // your server-side functionality
  const { name } = JSON.parse(event.body);

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({msg: 'Hello ' + name}),
  });
}
