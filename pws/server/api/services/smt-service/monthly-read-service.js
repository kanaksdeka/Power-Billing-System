var co = require('co');
var path = require('path');
var _ = require("lodash");
var appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
var apiDetails = require(path.join(appRoot, '/api/config/settings.js'));
var theRestCall = require(path.join(appRoot, 'utils/https-call.js'));
let moment = require('moment');

var logger = getLogger('monthlyReadService');

function monthlyReadService(param) {
    this.params = {};
    this.trans_id = param.trans_id;
    this.requestId = param.requestId;
    this.startDate = param.startDate;
    this.endDate = param.endDate;
    this.esiid = [];
    this.esiid.push(param.esiid);
}

monthlyReadService.prototype.init = function () {
}


monthlyReadService.prototype.fetchFromSMT = function () {
    var self = this;
    var error = {};

    return new Promise(function (resolve, reject) {
        try {
            co(function* () {
                let queryArray = []
                if (logLevel === "DEBUG")
                    logger.debug("requestId :: " + self.requestId + ":: Inside fetchFromSMT");

                var fetchData = JSON.stringify({
                    "trans_id": self.trans_id,
                    "requestorID": apiDetails.SMT.user.requestorID,
                    "requesterType": apiDetails.SMT.user.requesterType,
                    "requesterAuthenticationID": apiDetails.SMT.user.requesterAuthenticationID,
                    "startDate": self.startDate,
                    "endDate": self.endDate,
                    "version": "L",
                    "readingType": "c",
                    "esiid": self.esiid,
                    "SMTTermsandConditions": "Y"
                });

                var param = {
                    path: apiDetails.SMT.monthly_read.url,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(fetchData)

                    },
                    timeout: apiDetails.API_TIME_OUT

                };

                var smt_reading = yield theRestCall.httpsCall(param,fetchData,self.requestId)

                logger.error("requestId :: " + self.requestId + ":: fetchFromSMT smt_reading -" + JSON.stringify(smt_reading));
                self.params.reading = smt_reading;

                if(smt_reading.body.hasOwnProperty('billingData')){
                    resolve({"billingdata":smt_reading.body.billingData});
                }else{
                    resolve({"billingdata":[]});
                }

            }).catch(function (err) {
                logger.error("requestId :: " + self.requestId + ":: fetchFromSMT Error -" + JSON.stringify(err) + "Raw Error -",err ) ;
                if(err.errorCode_="400-HTTPS-001")
                    reject(mapError.errorCodeToDesc(self.requestId, '400','fetchfromsmt'));
                else
                    reject(mapError.errorCodeToDesc(self.requestId, '500','fetchfromsmt'));

            });
        } catch (err) {
            logger.error("requestId :: " + self.requestId + ":: fetchFromSMT Exception -" + JSON.stringify(err));
            reject(err);
        }
    });
}














module.exports = monthlyReadService;
