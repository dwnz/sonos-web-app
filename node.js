//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');
var r = require('request');

//Lets define a port we want to listen to
const PORT = 8080;

//We need a function which handles requests and send response
function handleRequest(request, response) {
	if (request.url === '/') {
		request.url = '/index.html';
	}

	if (request.url.indexOf('/api/') !== -1) {
		var parts = request.url.split('/');
		console.log(parts);

		switch (parts[2]) {
			case 'play':
				r('http://localhost:5005/Upstairs/spotify/queue/' + parts[3], function(error, rr, body) {
					console.log(error, body);
					response.end("Hello");
					return;
				});
				break;

			case 'state':
				r('http://localhost:5005/Upstairs/state', function(err, resp, body) {
					return response.end(body);
				});
				return;
			default:
				response.end("Bad request");
				return;
		}
	} else {

		try {
			response.end(fs.readFileSync(__dirname + request.url));
		} catch (e) {
			response.end();
		}
	}
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function() {
	//Callback triggered when server is successfully listening. Hurray!
	console.log("Server listening on: http://localhost:%s", PORT);
});