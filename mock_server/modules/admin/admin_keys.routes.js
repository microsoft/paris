common = require("../../mock_common");
fs = require("fs");

module.exports.init = function(app){
	app.get("/api/admin/keys/csr/request", function(req, res){
		var responseCbk = common.getResponseCallback(res);
		fs.readFile(common.MOCK_DATA_FOLDER + "admin/keys/csr/request.txt", "utf8", function(err, data){
			if (err)
				responseCbk(err);
			else {
				responseCbk(null, data);
			}
		});
	});

	app.post("/api/admin/keys/csr/request", function(req, res){
		setTimeout(function() {
			common.getFileData(common.MOCK_DATA_FOLDER + "admin/keys/csr/request", common.getResponseCallback(res));
		}, 3000);
	});

	app.post("/api/admin/keys/csr/response", function(req, res){
		setTimeout(function() {
			common.getFileData(common.MOCK_DATA_FOLDER + "admin/keys/csr/response", common.getResponseCallback(res));
		}, 2000);
	});

};
