'use strict';

var WsServer = require('ws').Server;
var server = require('http').createServer();

// Create web socket server on top of a regular http server
var wss = new WsServer({
  server: server,
	path: '/ws'
});

var modules = [
];

var availableStreams = new Map(modules.map(function(module){
	var s = module.stream;
	return [s.streamName, s]
}));

wss.on('connection', function connection(ws) {
	var registeredStreams = [];

	ws.on('message', function incoming(message) {
		var parsedMessage = JSON.parse(message);

		console.log('got message: ' + message);
		var streamName = parsedMessage.stream;
		var stream = streamName ? availableStreams.get(streamName) : null;

		if (parsedMessage.action === 'register'){
			if (stream){
				stream.startStream(ws);
				registeredStreams.push(stream);
			}
		}

		if (parsedMessage.action === 'unregister'){
			if (stream){
				stream.stopStream();
			}
		}

	});

	ws.on('error', function error(err){
		registeredStreams.forEach(function(stream){
			console.log('stopping stream ' + stream);
			stream.stopStream();
		})
	});
});

module.exports = server;
