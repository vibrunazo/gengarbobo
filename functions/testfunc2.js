exports.handler = function(event, context, callback) {
  // your server-side functionality

  callback(null, {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({msg: 'Hello moooooooo'}),
  });
}
