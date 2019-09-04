exports.handler = function(event, context, callback) {
  // your server-side functionality
  console.log('something on log');

  callback(null, {
    statusCode: 200,
    body: "Hello, World 4"
  });
}
