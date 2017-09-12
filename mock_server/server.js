const port = 5001;

var httpApp = require('./http-server');
var server = require('./ws-server');


server.on('request', httpApp);

server.listen(port, function (err) {
	if (err)
		throw new Error(err);

	console.log('Listening on port: ' + port + '.');
});
