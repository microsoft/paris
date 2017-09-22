common = require("../../mock_common");

var adminRouteModules = [
	require("./admin_keys.routes"),
	require("./admin_settings.routes")
];

module.exports.init = function(app){
	adminRouteModules.forEach(function(routeModule){
		routeModule.init(app);
	});

	app.post("/api/admin/license/activate", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "admin/license/all", common.getResponseCallback(res));
	});

	app.post("/api/admin/quarantine_password/unveil", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "admin/quarantine_password/unveil", common.getResponseCallback(res));
	});

	app.get("/api/admin/systeminfo/all", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "admin/systeminfo/all", common.getResponseCallback(res));
	});

};
