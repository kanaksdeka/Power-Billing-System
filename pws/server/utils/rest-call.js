let request = require('request');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let apiDetails = require(path.join(appRoot, '/api/config/settings.js'));
let mapError = require(path.join(appRoot, '/utils/codeToErrorMapping.js'));

let logger = getLogger('restCall');



let restCall = function(){

}
restCall.prototype.restCall = function(param,requestId){
	let methodStartTime = new Date();
	let _requestId=typeof requestId !== 'undefined' && requestId.length>0 ? requestId: '';

	if(logLevel === "INFO")
		logger.info("requestId :: "+ _requestId +":: restCall methodStartTime :::" + methodStartTime);
    if (logLevel === "DEBUG"){
		logger.debug("requestId :: "+ _requestId +":: restCall Input -"+JSON.stringify(param));
	}


	return new Promise(function (resolve, reject) {
		try{
			var requestParam={};
			requestParam.url=param.url; //URL to hit
			requestParam.method= param.method;//Specify the method,
//			requestParam.timeout=apiDetails.API_TIME_OUT; The timeout configured

			requestParam.headers = {
					'Content-Type' :  'application/json',
					'AuthorizationFlag' : 'N'
			};

            requestParam.body = JSON.stringify(param.body);


			var requestStartTime = new Date();
		    if (logLevel === "DEBUG")
				logger.debug("requestId :: "+ _requestId +":: restCall requestParam -"+JSON.stringify(requestParam));


			request(requestParam, function(error, response, body){

				if(logLevel === "INFO")
					logger.info("requestId :: "+ _requestId +":: restCall request end time :::" + new Date());

				if(logLevel === "INFO")
					logger.info("requestId :: "+ _requestId +":: restCall request taken time  :::" + new Date() - requestStartTime);
				if (body){
					logger.debug("requestId :: "+ _requestId +":: restCall responseParam::" + body);
					resolve(JSON.parse(body));
				}else{
					logger.debug("requestId :: "+ _requestId +":: restCall request else block ::" + error);
					reject(mapError.errorCodeToDesc(_requestId, '500','httpcall'));
				}
			});
		}catch(error){
				logger.error("requestId :: "+ _requestId +":: restCall catch block::" + error);
				reject(mapError.errorCodeToDesc(_requestId, '501','httpcall'));
		}
	});

}


module.exports = new restCall();
