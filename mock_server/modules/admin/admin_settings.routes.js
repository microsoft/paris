common = require("../../mock_common");

module.exports.init = function(app){
	app.put("/api/admin/settings/organization/all", function(req, res){
		res.status(200).json({ detail: "BAD BAD NOT GOOD"});
	});

	app.post("/api/admin/settings/domains/validate_groups", function(req, res){
		res.status(200).json({"valid":false,"errors":["Group with name AirsAdminssdfsdss does not exist"]});
	});

	app.post("/api/admin/domains", function(req, res){
		setTimeout(function(){
			var obj = req.body;
			obj.id = Math.round(Math.random() * Math.pow(10, 10));
			res.status(200).json(obj);
		}, 1000);
	});

	app.get("/api/admin/domains/", function(req, res){
		setTimeout(function(){
			common.getFileData(common.MOCK_DATA_FOLDER + "admin/domains", common.getResponseCallback(res));
		}, 1000);
	});
	app.get("/api/admin/settings/domains/dns", function(req, res){
		setTimeout(function(){
			common.getFileData(common.MOCK_DATA_FOLDER + "admin/dns", common.getResponseCallback(res));
		}, 1000);
	});

	app.post("/api/admin/settings/:settingsGroup/validate_:settingId", function(req, res){
		setTimeout(function(){
			common.getFileData(common.MOCK_DATA_FOLDER + "admin/settings/validate_setting", common.getResponseCallback(res));
		}, 2000);
	});

	app.post("/api/admin/settings/verify_user", function(req, res){
		setTimeout(function(){
			common.getFileData(common.MOCK_DATA_FOLDER + "admin/settings/verify_user", common.getResponseCallback(res));
		}, 1000);
	});

	app.get("/api/admin/settings/:settingsGroup/:settingId", function(req, res){
		common.getFileData(common.MOCK_DATA_FOLDER + "admin/settings/values/settings." + req.params.settingsGroup, function(err, data){
			if (err)
				res.status(404).end();
			else{
				setTimeout(function(){
					res.status(200).json(req.params.settingId === "all" ? { "data": data } : data[req.params.settingId]);
				}, 400);
			}
		});
	});
};
