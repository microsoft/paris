fs = require("fs");

var MOCK_DATA_FOLDER = "./data/";

var exports = module.exports = {
	getFileData: getFileData,
	getIdentifiableItem: getIdentifiableItem,
	getResponseCallback: getResponseCallback,
	MOCK_DATA_FOLDER: MOCK_DATA_FOLDER,
	sendError: sendError
};

function sendError(status, errorText){
	if (!status)
		status = 500;

	if (!errorText)
		errorText = "SERVER ERROR";

	return function(req, res){
		res.status(status).send(errorText);
	};
}

function getResponseCallback(res){
	return function(err, data){
		if (err)
			res.status(404).end();
		else
			res.status(200).json(data);
	}
}
/**
 * Returns a function to handler requests with an ID, which all map to the same mock data file.
 * @param path {String} The path of the single JSON file to return for any ID
 * @param idProperty The ID property to add to the result JSON data (the value is the 'id' param in the URL)
 * @returns {Function}
 */
function getIdentifiableItem(path, idProperty){
	var itemMockDataFolder = MOCK_DATA_FOLDER + path;
	return function(req, res){
		getFileData(itemMockDataFolder, function(err, itemData){
			if (err) {
				res.status(404).end()
			}
			else {
				var id = parseInt(req.params.id, 10);
				itemData[idProperty || "id"] = !isNaN(id) ? id : req.params.id;
				res.json(itemData);
			}
		});
	};
}

function getFileData(filePath, callback){
	fs.readFile(filePath + ".json", "utf8", function(err, data){
		if (err) {
			console.error("ERROR reading file: ", filePath);
			callback(err);
		}
		else {
			try {
				var fileData = JSON.parse(data);
				callback(null, fileData);
			}
			catch(e){
				console.error("ERROR parsing json: " + filePath + data + ": " + e.message);
				callback("ERROR parsing json: " + filePath);
			}
		}
	});
}
