exports.handler = function(event, context, callback) {
  // your server-side functionality

  callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: 'Hello test func 3'
  });
}
