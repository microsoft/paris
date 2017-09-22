common = require("../mock_common");
var url = require('url');

module.exports.init = function(app){
	app.get("/api/alerts", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "alerts/alerts_mock", common.getResponseCallback(res));
	});

	app.get("/api/alerts/filters", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "alerts/alerts_filters", common.getResponseCallback(res));
	});

	app.get("/api/alerts/count_by_type", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "alerts/count_by_type", common.getResponseCallback(res));
	});

	app.get("/api/alerts/:id", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "alerts/alert_mock", common.getResponseCallback(res));
	});
};
