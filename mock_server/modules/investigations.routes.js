common = require("../mock_common");

var investigationStatuses = {
	"3": "fully_remediated",
	"9": "terminated_by_airs",
	"14": "benign",
	"15": "terminated_by_user",
	"16": "pending_user",
	"17": "running",
	"18": "pending_resource"
};

module.exports.init = function(app){
	app.get("/api/investigations/:id(\\d+)", function(req, res){
		var investigationStatus = investigationStatuses[String(req.params.id)],
			investigationMockUrl = investigationStatus ? "investigations_by_status/investigation." + investigationStatus + ".mock" : "investigation_mock";

		common.getFileData(common.MOCK_DATA_FOLDER + "investigations/" + investigationMockUrl, common.getResponseCallback(res));
	});

	app.get("/api/investigations/filters", function(req, res){
		setTimeout(function(){
			common.getFileData(common.MOCK_DATA_FOLDER + "investigations/investigation_filters_mock", common.getResponseCallback(res));
		}, 500)
	});

	app.get("/api/investigations/:investigationId/export", function(req, res){
		setTimeout(function(){
			res.status(500).send("Couldn't export investigation.");
		}, 3000);
	});

	app.get("/api/investigations/all", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "investigations/all", sendResponse);

		function setToPageSize(data){
			if (data && req.query.page_size)
				data.results = data.results.slice(0, req.query.page_size);
		}

		function sendResponse(error, data){
			setToPageSize(data);
			if (error)
				res.status(200).json({ count: 0, results: [] });
			else
				res.status(200).json(data);
		}
	});

	app.get("/api/investigations/:id/hosts/filters/search", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "investigations/hosts/investigation_hosts_filter_search", common.getResponseCallback(res));
	});

	app.get("/api/investigations/:id/actions", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "investigations/actions/investigation_actions_mock", common.getResponseCallback(res));
	});

	app.get("/api/investigations/:id/actions/filters", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "investigations/actions/investigation_actions_filters", common.getResponseCallback(res));
	});

	app.get("/api/investigations/:id/actions/filters/search", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "investigations/actions/investigation_actions_filter_search", common.getResponseCallback(res));
	});

	app.patch("/api/investigations/:id", function(req, res){
		// Adding timeout to simulate server time:
		res.setTimeout(1000, function(){
			common.getFileData(common.MOCK_DATA_FOLDER + "investigations/patch_investigation", common.getResponseCallback(res));
		});
	});
};
