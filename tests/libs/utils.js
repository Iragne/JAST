
 
module.exports.defaultGetOptions = function (path,port,sessionCookie) {
	var options = {
		"host": "localhost",
		"port": port || 4242,
		"path": path ,
		"method": "GET",
		"headers": {
			"Cookie": sessionCookie
		}
	};
	return options;
};


module.exports.defaultPostOptions = function (path,port,data,sessionCookie) {
	var options = {
		"host": "localhost",
		"port": port || 4242,
		"path": path ,
		"method": "POST",
		"headers": {
			"Cookie": sessionCookie,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		}
	};
	return options;
};


