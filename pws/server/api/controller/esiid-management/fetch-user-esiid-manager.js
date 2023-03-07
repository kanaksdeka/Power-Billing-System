'use strict';
let co = require('co');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let fetchesiidService=require(path.join(appRoot, '/api/services/esiid-service/address-to-esiid-service.js'));
let meterinfoService=require(path.join(appRoot, '/api/services/smt-service/meter-info-service.js'));
let moment=require('moment');


// This API fetches the ESIID given a addresss reads from http://apis.esiids.com/


exports.fetchesiid = function(req, res) {
    const requestId = req.id;
    const logger = getLogger('fetchesiid');
    
    co(function*() {

        if (logLevel === "DEBUG") {
            logger.debug("fetchesiid controller Start");
        }

        var param = {};
        param.requestId = req.id;
        param.address=typeof req.body.address!="undefined" && req.body.address.length>0?req.body.address:"";
        param.zipcode=typeof req.body.zipcode!="undefined" && req.body.zipcode>0?req.body.zipcode:0;
        param.premise_type=typeof req.body.premise_type!="undefined" && req.body.premise_type.length>0?req.body.premise_type:"";
        param.apartmentNumber = typeof req.body.apartmentNumber != "undefined" && req.body.apartmentNumber.length > 0 ? req.body.apartmentNumber : "";

        let esiiObj = new fetchesiidService(param);
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: fetchesiid Controller ::  Query -"+JSON.stringify(param));
        let inputValidation=false;
        let residenceValidation=false;
        inputValidation=yield esiiObj.validateAddressPayload();
        residenceValidation=yield esiiObj.validateResidencePayload();

        let validStatus = yield esiiObj.validateZipCode();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: fetchesiid Controller ::  ZIP Code found");
          
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: fetchesiid Controller :: Fetching from ESIID ");
            let fetchStatus = yield esiiObj.fetchesiid();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: fetchesiid Controller :: ESIID returned fetch as - "+JSON.stringify(fetchStatus));
            res.send(fetchStatus)
           // res.send("Success")
    
   }).catch(function(err) {
        logger.error("requestId :: " + requestId + ":: fetchesiid Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
        res.status(500).send(err)
    });
};


