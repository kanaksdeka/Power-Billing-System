let request = require('request');
let path = require('path');
let https = require('https');

let fs = require('fs');

let appRoot = path.join(require('app-root-dir').get(), '/server/');
let apiDetails = require(path.join(appRoot, '/api/config/settings.js'));
let mapError = require(path.join(appRoot, '/utils/codeToErrorMapping.js'));

let logger = getLogger('httpsCall');



let httpsCall = function () {

}

httpsCall.prototype.httpsCall = function (param, fetchData,requestId) {
    let methodStartTime = new Date();
    let _requestId = typeof requestId !== 'undefined' && requestId.length > 0 ? requestId : '';

    if (logLevel === "INFO")
        logger.info("requestId :: " + _requestId + ":: httpsCall methodStartTime :::" + methodStartTime);


    param.port = 443;
    param.hostname = apiDetails.SMT.certficate.hostname,
    param.rejectUnauthorized = false;
    param.key = fs.readFileSync(apiDetails.SMT.certficate.key);
    param.cert = fs.readFileSync(apiDetails.SMT.certficate.cert);
    param.secureProtocol = "TLSv1_2_method";
    param.headers.Authorization = {};
    param.headers.Authorization = 'Basic ' + Buffer.from(apiDetails.SMT.user.auth.user + ':' + apiDetails.SMT.user.auth.pass).toString('base64');
    //param.headers.Authorization = 'Basic ' + new Buffer(apiDetails.SMT.user.auth.user + ':' + apiDetails.SMT.user.auth.pass).toString('base64');


    if (logLevel === "DEBUG")
        logger.debug("requestId :: " + _requestId + ":: httpsCall Input -" + JSON.stringify(fetchData));

    return new Promise(function (resolve, reject) {
        try {

            var requestStartTime = new Date();
            let resolvingData = {};
            var requ = https.request(param,
                (res) => {
                    let body = '';
                    res.on('data', (chunk) => (body += chunk.toString()));
                    res.on('error', ()=>{
                        logger.error("requestId :: " + _requestId + ":: httpsCall res.on(error) ");
                        reject(mapError.errorCodeToDesc(_requestId, '500','httpscall'));
                    });
                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode <= 299) {
                            if (logLevel === "INFO")
                                logger.info("requestId :: " + _requestId + ":: httpsCall request taken time  :::" + new Date() - requestStartTime);
                            if (logLevel === "DEBUG") {
                                logger.debug("requestId :: " + _requestId + ":: httpsCall statusCode -" + res.statusCode);
                                logger.debug("requestId :: " + _requestId + ":: httpsCall headers -" + JSON.stringify(res.headers));
                            }
                            if (logLevel === "DEBUG")
                                logger.debug("requestId :: " + _requestId + ":: httpsCall request response -" + JSON.parse(body));
                            resolve({ statusCode: res.statusCode, headers: res.headers, body: JSON.parse(body) });
                        }else if(res.statusCode == 400){
                            logger.error("requestId :: " + _requestId + ":: httpsCall 400  request in elseif received -"+ res.statusCode);
                            logger.error("requestId :: " + _requestId + ":: httpsCall 400 request in elseif received status message -"+ res.statusMessage);
                            if(res.statusMessage=="Bad Request")
                                reject(mapError.errorCodeToDesc(_requestId, '401','httpscall'));
                            else
                                reject(mapError.errorCodeToDesc(_requestId, '400','httpscall'));

                        } else if(res.statusCode == 412){
                            logger.debug("requestId :: " + _requestId + ":: httpsCall 412 request in elseif received -"+ res.statusCode);
                            logger.debug("requestId :: " + _requestId + ":: httpsCall 412 request in elseif received status message -"+ res.statusMessage);
                            logger.debug("requestId :: " + _requestId + ":: httpsCall 412 request in elseif received body -"+body);

                            //if(res.statusMessage=="Precondition Failed" && body.customerMeterFaultList[0].reason == "Incorrect ESIID-METER-REP Combination:")
                            if(res.statusMessage=="Precondition Failed")
                                reject(mapError.errorCodeToDesc(_requestId, '402','httpscall'));
                            else
                                reject(mapError.errorCodeToDesc(_requestId, '400','httpscall'));

                        } 
                        else {
                                logger.error("requestId :: " + _requestId + ":: httpsCall request Error Status -"+ res.statusCode + " Body -"+body);
                                reject(mapError.errorCodeToDesc(_requestId, '501','httpscall'));
                                //reject('Request failed. status: ' + res.statusCode + ', body: ' + body);
                        }
                    });
                 
                });
            requ.on('error', (error)=>{
                logger.error("requestId :: " + _requestId + ":: httpsCall requ.on(error)",error);
                reject(mapError.errorCodeToDesc(_requestId, '502','httpscall'));
            });
            requ.write(fetchData, 'binary');
            requ.on('timeout', function () {
                requ.abort();
                logger.error("requestId :: " + _requestId + ":: httpsCall requ.on(timeout)");
                reject(mapError.errorCodeToDesc(_requestId, '503','httpscall'));
                   // reject('Request failed. status: ' +  timeout( new Error('request timed out') ));
              });
              requ.on('socket', function (socket) {
              socket.setTimeout( param.timeout );
                socket.on('timeout', function() {
                    logger.error("requestId :: " + _requestId + ":: httpsCall socket.on(timeout)");
                    requ.abort();
                    reject(mapError.errorCodeToDesc(_requestId, '504','httpscall'));
                        //reject('Request failed. status: ' +  timeout( new Error('request timed out') ));
                });
            });
            requ.end();
        }catch (error) {
            logger.error("requestId :: " + _requestId + ":: httpsCall catch block::" + error);
            reject(mapError.errorCodeToDesc(_requestId, '505','httpscall'));
            //reject(error);
        }
	});

}


module.exports = new httpsCall();
