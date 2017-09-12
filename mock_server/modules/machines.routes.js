common = require("../mock_common");

module.exports.init = function(app){
	app.get("/api/machines/all", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "machines/machines_mock", common.getResponseCallback(res));
	});

	app.get("/api/machines/filters", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "machines/machines_filters", common.getResponseCallback(res));
	});

	app.get("/api/machines/count_by_type", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "machines/count_by_type", common.getResponseCallback(res));
	});

	app.get("/api/machines/:id", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "machines/machine_mock", common.getResponseCallback(res));
	});
};
