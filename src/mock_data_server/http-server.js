const express = require('express');
const bodyParser = require('body-parser');

var routeModules = [
	//require("./modules/investigations.routes"),
	//require("./modules/alerts.routes"),
	//require("./modules/machines.routes")
];

var common = require("./mock_common");

var app = express();

var jsonParser = bodyParser.json();
var busboy = require('connect-busboy');

function customHeaders(req, res, next) {
	// Switch off the default 'X-Powered-By: Express' header
	app.disable('connection');
	res.removeHeader("connection");
	next();
}

routeModules.forEach(function (routeModule) {
	routeModule.init(app, jsonParser);
});

app.use(customHeaders);
app.use(jsonParser);
app.use(busboy());


/**
 * All other API calls return the corresponding file inside the api_mock_data folder
 */
app.use(function (req, res) {
	// All delete requests are OK
	if (req.method === "DELETE") {
		setTimeout(function () {
			res.status(200).end();
		}, 1000);
	}
	else if (req.method === "PATCH" || req.method === "PUT") {
		setTimeout(function () {
			var obj = req.body;
			res.status(200).json(obj);
		}, 600);
	}
	else {
		var mockDataFileUrl = req.originalUrl.replace(/^\/api\//, common.MOCK_DATA_FOLDER).replace(/\.json/, "").replace(/\?.+/, "");
		var apiMatch = req.originalUrl.match(/^\/api\/([\w-_\d\/]+)\/([\w\d-_]+)?$/);

		if (apiMatch){
			var entity = apiMatch[1],
				entityId = apiMatch[2];

			// If the URL ends with '/', we expect all the data in the folder, which is mocked by the 'all.json' file inside it:
			mockDataFileUrl = common.MOCK_DATA_FOLDER + entity + "/" + entity.replace(/\//g, "_") + (entityId || req.method === "POST" ? "_item" : "_all") + ".mock";
		}

		if (req.method === "POST") {
			common.getFileData(mockDataFileUrl, function (error, data) {
				if (error) {
					setTimeout(function () {
						var obj = req.body;
						obj.id = Math.round(Math.random() * Math.pow(10, 10));
						res.status(200).json(obj);
					}, 1000);
				}
				else {
					var itemId = +new Date;
					common.getResponseCallback(res)(null, Object.assign(data, req.body, { id: itemId }));
				}
			});
		}
		else {
			common.getFileData(mockDataFileUrl, common.getResponseCallback(res));
		}
	}
});


//https.createServer(options, app).listen(port);

// http2
// 	.createServer(options, app)
// 	.listen(port, function(err){
// 		if (err)
// 			throw new Error(err);
//
// 		/* eslint-disable no-console */
// 		console.log('Listening on port: ' + port + '.');
// 		/* eslint-enable no-console */
// 	});

module.exports = app;
