var co = require('co');
var path = require('path');
var appRoot = path.join(require('app-root-dir').get(), '/server/');
var crud = require(path.join(appRoot, '/api/services/dao-mongo/crud/crud_operations.js'));
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
var apiDetails = require(path.join(appRoot, '/api/config/settings.js'));
var theRestCall = require(path.join(appRoot, 'utils/rest-call.js'));
var schema = require("schemajs");
let zip2tduModel = require(path.join(appRoot, '/api/models/Zip2TDU'));
let _ = require("lodash");


var logger = getLogger('fetchesiidService');

function fetchesiidService(param) {
    this.params = {};
    this.address = param.address
    this.zipcode = param.zipcode;
    this.requestId=param.requestId;
    this.premise=param.premise_type;
    this.apartmentnumber=param.apartmentNumber;
}

fetchesiidService.prototype.init = function () {
}

fetchesiidService.prototype.validateAddressPayload = function () {
    var self = this;
    return new Promise(function (resolve, reject) {

    if (logLevel === "DEBUG")
        logger.debug("requestId :: " + self.requestId + ":: validateAddressPayload :: Called");

    var model = schema.create({
        address:{
            type: "string",
            filters: "trim",
            properties: {
                max: 255,
                regex:/^([a-zA-Z0-9 ]+)$/
            },
            required: true
        }
    });
    var validate = model.validate({
        address:self.address
    });

    if (logLevel === "DEBUG") {
        logger.info("requestId :: " + self.requestId + ":: validating for -" + JSON.stringify(validate));
        logger.info("requestId :: " + self.requestId + ":: validateAddressPayload :: Returning -" + validate.valid);
    }
    if(validate.valid)
        resolve(validate.valid);
    else
        reject(mapError.errorCodeToDesc(self.requestId, '400','fetchesiid'));

});
}


fetchesiidService.prototype.validateResidencePayload = function () {
    var self = this;
    return new Promise(function (resolve, reject) {

    if (logLevel === "DEBUG")
        logger.debug("requestId :: " + self.requestId + ":: validateResidencePayload :: Called");

    var model = schema.create({
        premise_type:{
            type: "string",
            filters: "trim",
            properties: {
                max: 255,
                regex:/^(residential|commercial)$/

            },
            required: true
        }
    });
    var validate = model.validate({
        premise_type:self.premise.toLowerCase()
    });

    if (logLevel === "DEBUG") {
        logger.info("requestId :: " + self.requestId + ":: validating for -" + JSON.stringify(validate));
        logger.info("requestId :: " + self.requestId + ":: validateResidencePayload :: Returning -" + validate.valid);
    }

    if(validate.valid)
        resolve(validate.valid);
    else
        reject(mapError.errorCodeToDesc(self.requestId, '401','fetchesiid'));});
}

fetchesiidService.prototype.validateZipCode= function () {
    let self = this;
    return new Promise(function (resolve, reject) {
        co(function* () {
            let queryPayload = {
                "zip":self.zipcode
            }
            logger.debug("requestId :: " + self.requestId + " :: validateZipCode queryPayload -"+JSON.stringify(queryPayload));

            var fetchTdu = yield crud.getOne('zip2tdus',zip2tduModel,queryPayload, self.requestId,'fetchesiid') 
            logger.debug("requestId :: " + self.requestId + " :: validateZipCode fetchTdu -"+JSON.stringify(fetchTdu));

            var returnObj=fetchTdu[0];

            if(returnObj && Object.keys(returnObj).length > 0){
                logger.debug("requestId :: " + self.requestId + " :: validateZipCode Zip found -"+JSON.stringify(returnObj));
                resolve(returnObj);

            }else{
                logger.debug("requestId :: " + self.requestId + " :: validateZipCode Zip not found ");
                reject(mapError.errorCodeToDesc(self.requestId, '501','fetchesiid'));
            }
                
        }).catch(function (err) {
            logger.error("requestId :: " + self.requestId + " :: validateZipCode Error -" + err);
            reject(err);
        })
    });

}


fetchesiidService.prototype.fetchesiid= function () {
    var self = this;
   
    return new Promise(function (resolve, reject) {
        try {
            co(function* () {
                let queryArray = []
                if (logLevel === "DEBUG")
                    logger.debug("requestId :: " + self.requestId + ":: fetchesiid for -"+self.address);

                    let _premises='';
                    if(self.premise.toLowerCase()=="residential")
                        _premises='r';
                    else  
                        _premises='c';

                    var address_="";
                    if(parseInt(self.apartmentnumber)>0)
                        address_=self.address+" _"+self.apartmentnumber
                    else    
                        address_=self.address

                    var fetchData =apiDetails.ESIID.key+"/format/json/address/"+address_.replace(/\s/g, '_')+"/zip/"+self.zipcode+"/premise_type/"+_premises;

                    var param = {
                        url: apiDetails.ESIID.url+fetchData,
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'AuthorizationFlag': 'N'
                        },
                        timeout: apiDetails.API_TIME_OUT

                    };

                var esiidDetails = yield theRestCall.restCall(param, self.requestId)

                logger.debug("requestId :: " + self.requestId + ":: " + 'fetchesiid :: esiidDetails Response -' + JSON.stringify(esiidDetails));
                self.params.esiidDetails ={};
                self.params.esiidDetails = esiidDetails;
                if (_.hasIn(esiidDetails, 'rows') )
                    resolve({address:esiidDetails.rows});
              else
                    reject(mapError.errorCodeToDesc(self.requestId, '502','fetchesiid'));


            }).catch(function (err) {
                logger.error("requestId :: " + self.requestId + ":: fetchesiid Error -" + JSON.stringify(err));
                reject(err);
            });
        } catch (err) {
            logger.error("requestId :: " + self.requestId + ":: fetchesiid Exception -" + JSON.stringify(err));
            reject(err);
        }
    });
}



module.exports = fetchesiidService;
