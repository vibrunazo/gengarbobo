exports.handler = function(event, context, callback) {
  // your server-side functionality

  callback(null, {
    statusCode: 200,
    'Access-Control-Allow-Origin': '*',
    body: 'Hello test func 2'
  });
}
