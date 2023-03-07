'use strict';
let co = require('co');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let monthlyreadService = require(path.join(appRoot, '/api/services/smt-service/monthly-read-service.js'));
let newAgreementService = require(path.join(appRoot, '/api/services/smt-service/new-agreement-service.js'));
let premiseInfoService = require(path.join(appRoot, '/api/services/smt-service/premise-info-service.js'));
let meterinfoService = require(path.join(appRoot, '/api/services/smt-service/meter-info-service.js'));
let newAgreementStatusService = require(path.join(appRoot, '/api/services/smt-service/new-agreement-status-service.js'));
var apiDetails = require(path.join(appRoot, '/api/config/settings.js'));

const User = require(path.join(appRoot, 'api/models/User'));

let moment = require('moment');
let _ = require("lodash");
let async = require('async');
const { lte } = require('lodash');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));


// This API fetches monthly reads from SMT
/*Payload Format as per SMT Doc
{
"trans_id": "111",
"requestorID": "byiggapi",
"requesterType": "CSP",
"requesterAuthenticationID":"122501123",
"startDate": "02/02/2020",
"endDate": "02/28/2020",
"version": "L",
"readingType": "c",
"esiid": [
"1008901023901266050117"
],
"SMTTermsandConditions": "Y"
}

*/



exports.monthlyread = function (req, res) {
    const requestId = req.id;
    const logger = getLogger('monthlyread');

    co(function* () {

        if (logLevel === "DEBUG") {
            logger.debug("monthlyread controller Start");
        }

        var param = {};
        param.trans_id = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss');
        param.requestId = req.id;
        param.startDate = req.body.startDate;
        param.endDate = req.body.endDate;
        param.esiid = req.body.esiid;


        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: monthlyread Controller ::  Query -" + JSON.stringify(param));
        var readObj = new monthlyreadService(param);
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: monthlyread Controller :: Fetching from SMT ");
        var fetchStatus = yield readObj.fetchFromSMT();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: monthlyread Controller :: SMT returned month read as - " + JSON.stringify(fetchStatus));
        res.send(fetchStatus)
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + ":: monthlyread Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
        res.status(500).send(err)
    });
};



exports.fetchusagefromsmt = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('fetchusagefromsmt');
    var param = {};


    // try {
    const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;

    var queryPayload = { "token.token": authtoken };
    logger.debug("requestId :: " + requestId + ":: Query payload for fetchusagefromsmt -" + JSON.stringify(queryPayload));

    //User.findOne(queryPayload).then(function (err,user) {
    User.findOne(queryPayload, (err, user) => {
        if (!user) {
            logger.error("requestId :: " + requestId + ":: No user found with logged token  -" + authtoken);
            res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "getprofile"))
        } else {
            let duration = user.profile.address.duration != 'undefined' && user.profile.address.duration > 0 && user.profile.address.duration <= 12 ? user.profile.address.duration : 12;
            let response = {};

            param.trans_id = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss');
            param.requestId = req.id;
            param.endDate = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MM/DD/YYYY');
            param.startDate = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').subtract(duration, 'months').format('MM/DD/YYYY');
           // param.endDate = moment(new Date('05/12/2019'), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MM/DD/YYYY');
           // param.startDate = moment(new Date('10/12/2018'), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MM/DD/YYYY');
            param.esiid = user.profile.esiid;
            logger.debug("requestId :: " + requestId + ":: User found with email -" + user.email);
            co(function* () {
                if (logLevel === "DEBUG")
                    logger.debug("requestId :: " + requestId + ":: fetchusagefromsmt Controller ::  Query -" + JSON.stringify(param));
                var readObj = new monthlyreadService(param);
                if (logLevel === "DEBUG")
                    logger.debug("requestId :: " + requestId + ":: fetchusagefromsmt Controller :: Fetching from SMT ");
                var fetchStatus = yield readObj.fetchFromSMT();
                if (fetchStatus.billingdata.length < 1) {
                    logger.debug("requestId :: " + requestId + ":: fetchusagefromsmt Controller :: SMT returned no data found");
                    res.send(fetchStatus)
                } else {

                    //Start of Scalar Algo
                    const usage = req.body.usage;

                    //Get the Start month SMT returned
                   // const month_splitted = fetchStatus.billingdata[0].endDate.split("/");
                    const month_splitted = fetchStatus.billingdata[0].startDate.split("/");

                    const start_month = parseInt(month_splitted[0])
                    logger.debug("requestId :: " + requestId + " :: Start month is -" + start_month);

                    //const last_month_splitted = fetchStatus.billingdata[fetchStatus.billingdata.length - 1].endDate.split("/");
                    const last_month_splitted = fetchStatus.billingdata[fetchStatus.billingdata.length - 1].startDate.split("/");

                    const last_month = parseInt(last_month_splitted[0])
                    logger.debug("requestId :: " + requestId + " :: Last month is -" + last_month);
                    logger.debug("requestId :: " + requestId + " :: Last month usage is  -" + fetchStatus.billingdata[fetchStatus.billingdata.length - 1].actualkWh);

                    const scalarrefarr = apiDetails.SCALARREF.scales;
                    let usagearr = [];
                    const month = last_month
                    const year = new Date().getFullYear()
                    /*scalarrefarr.forEach(function (refobj) {
                        var scusage = (parseFloat(fetchStatus.billingdata[fetchStatus.billingdata.length - 1].meteredKW) / scalarrefarr[parseInt(fetchStatus.billingdata.length - 1) - 1].scalarindex) * refobj.scalarindex
                        usagearr.push(Math.round(scusage))
                    })*/
                    //res.send(usagearr)
                    let skip_index=0;
                    var uniquearr=_.uniqBy(fetchStatus.billingdata.reverse(), 'startDate').reverse() //Removing duplicate objects rom the fetched array

                    scalarrefarr.forEach(function (refobj){

                        var scusage = (parseFloat(uniquearr[uniquearr.length - 1].actualkWh) / scalarrefarr[parseInt(uniquearr.length - 1) - 1].scalarindex) * refobj.scalarindex
                       /* if(skip_index==0){
                            skip_index++;
                            return;
                        }*/

                        var respObj={
                            'usage':Math.round(scusage),
                            'month':refobj.month,
                            'monthindex':parseInt(refobj.ind)
                        }
                        //if(refobj.ind>=parseInt(month) && refobj.ind<=12){
                        if(refobj.ind>parseInt(month) && refobj.ind<=12){

                            respObj.year=year,
                            respObj.sortIndex=parseInt(refobj.ind.toString()+year.toString())
                        }else{
                            respObj.year=year+1,
                            respObj.sortIndex=parseInt(refobj.ind.toString()+(year+1).toString())
                        }
             
                        usagearr.push(respObj)
                    })

                    //res.send(fetchStatus)

                    uniquearr.forEach(function (refobj) {
                        let index=0;
                        usagearr.forEach(function (scalarObj){
                            //let smt_month_splitted = refobj.endDate.split("/");
                            let smt_month_splitted = refobj.startDate.split("/");

                            let smt_month = parseInt(smt_month_splitted[0])
                        //    console.log("SMT month is -"+smt_month)
                         //   console.log("scalarObj month is -"+parseInt(scalarObj.monthindex))
                            if(smt_month==parseInt(scalarObj.monthindex)){
                               // console.log("Ref object is -"+refobj.actualkWh)
                               // usagearr[index].usage=Math.round(refobj.actualkWh)
                               logger.debug("requestId :: " + requestId + ":: Replacing -"+scalarObj.usage + " with smt -"+ refobj.actualkWh + " For month -"+ smt_month )
                                usagearr[index].usage=Math.round(refobj.actualkWh)
                                //usagearr[index].year=usagearr[index].year+1
                            }
                            index++;
                        })

                    })
                    //res.send(usagearr)
                


                let sortedusage=usagearr.sort((a, b) => (a.year > b.year) ? 1 : (a.year === b.year) ? ((a.sortIndex > b.sortIndex) ? 1 : -1) : -1 )
                logger.debug("requestId :: " + requestId + " :: fetchusagefromsmt usage after sorting -" + JSON.stringify(sortedusage));
        
                let finalresp=[];
                sortedusage.forEach(function (refobj){
                    //logger.debug("requestId :: " + requestId + " :: scalarmonthyear removing sort index for  -" + JSON.stringify(refobj));
                    delete refobj["sortIndex"];
                    delete refobj["monthindex"]

                    //logger.debug("requestId :: " + requestId + " :: scalarmonthyear trimmed object is   -" + JSON.stringify(refobj));
                    finalresp.push(refobj)
                })
        
                let response ={
                    'predictedusage':finalresp
                }  
                
                logger.debug("requestId :: " + requestId + " :: fetchusagefromsmt Predicted usage for the year -" + JSON.stringify(response));
                res.send(response)
            }

                //End of Scalar Algo
            }).catch(function (err) {
                logger.error("requestId :: " + requestId + ":: fetchusagefromsmt Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
                res.status(500).send(err)
            });

        }

    }).catch((error) => {
        logger.error("requestId :: " + requestId + " :: fetchusagefromsmt user search Exception -" + error);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "getprofile"))
    });
    /*    } catch (err) {
            logger.error("requestId :: " + requestId + " :: fetchusagefromsmt Exception -" + err);
            return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "getprofile"))
        }*/
};






//Payload for New Agreement as per SMT Doc
/*{
    "trans_id": "64576457",
    "requestorID": "UATCSPAPIDee6",
    "requesterAuthenticationID": "9678588888869",
    "retailCustomerEmail": "delluri281@gmail.com",
    "agreementDuration": 9,
    "customerLanguagePreference": "ENGLISH",
    "customerMeterList": [
    {
    "ESIID": "10032789400250865",
    "meterNumber": "144054330",
    "PUCTRORNumber": 10004
    }
    ],
    "SMTTermsandConditions": "Y"
}*/


exports.newagreement = function (req, res) {
    const requestId = req.id;
    const logger = getLogger('newagreement');

    co(function* () {

        if (logLevel === "DEBUG") {
            logger.debug("newagreement controller Start");
        }

        var param = {};
        param.trans_id = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss');
        param.requestId = req.id;
        param.email = req.body.email;
        param.duration = req.body.duration;
        param.meternumber = req.body.meternumber;
        param.puctrornumber = req.body.puctrornumber;
        param.esiid = req.body.esiid;


        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: newagreement Controller ::  Query -" + JSON.stringify(param));
        var agreementObj = new newAgreementService(param);
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: newagreement Controller :: registering with SMT ");
        var agreeStatus = yield agreementObj.agree();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: newagreement Controller :: SMT returned ack as  - " + JSON.stringify(agreeStatus));
        res.send(agreeStatus)
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + ":: newagreement Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
        res.status(500).send(err)
    });
};



exports.newagreementStatus_depreceated = function (req, res) {
    const requestId = req.id;
    const logger = getLogger('newagreementStatus');

    co(function* () {

        if (logLevel === "DEBUG") {
            logger.debug("newagreementStatus controller Start");
        }

        var param = {};
        param.trans_id = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss');
        param.requestId = req.id;
        param.email = req.body.email;
        param.agreementnumber = req.body.agreementnumber;
        //param.statusReason = req.body.statuscode;

        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: newagreementStatus Controller ::  Query -" + JSON.stringify(param));
        var agreementObj = new newAgreementStatusService(param);
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: newagreementStatus Controller :: fetching registration status from SMT ");
        var agreeStatus = yield agreementObj.agreestatus();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: newagreementStatus Controller :: SMT returned ack as  - " + JSON.stringify(agreeStatus));
        res.send(agreeStatus)
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + ":: newagreementStatus Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
        res.status(500).send(err)
    });
};



exports.newagreementStatus = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('newagreementStatus');
    var param = {};


    const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;

    var queryPayload = { "token.token": authtoken };
    logger.debug("requestId :: " + requestId + ":: Query payload for newagreementStatus -" + JSON.stringify(queryPayload));

    User.findOne(queryPayload, (err, user) => {
        if (!user) {
            logger.error("requestId :: " + requestId + ":: No user found with logged token  -" + authtoken);
            res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "getprofile"))
        } else {

            async.waterfall([
                function fetchstatusfromsmt(done) {
                    logger.debug("requestId :: " + requestId + ":: User found with email -" + user.email);
                    let response = {};
                    param.trans_id = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss');
                    param.requestId = req.id;
                    param.email = user.email;
                    param.agreementnumber = parseInt(user.status.dataSharingStatus.agreementNumber);
                    // param.statusReason = user.status.dataSharingStatus.statusCode;
                    co(function* () {
                        if (logLevel === "DEBUG")
                            logger.debug("requestId :: " + requestId + ":: newagreementStatus Controller ::  Query -" + JSON.stringify(param));
                        var readObj = new newAgreementStatusService(param);
                        if (logLevel === "DEBUG")
                            logger.debug("requestId :: " + requestId + ":: newagreementStatus Controller :: Fetching status from SMT ");
                        var fetchStatus = yield readObj.agreestatus();
                        done(null, fetchStatus);
                    }).catch(function (err) {
                        logger.error("requestId :: " + requestId + ":: newagreementStatus Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
                        res.status(500).send(err)
                    });
                },
                function updatesmtstatus(fetchStatus, done) {
                    if (fetchStatus.body.agreementStatusList[0].status == "Active - Authorization Confirmed") {
                        if (logLevel === "DEBUG")
                            logger.debug("requestId :: " + requestId + " :: newagreementStatus Controller payload for update -" + JSON.stringify(fetchStatus));

                        user.status.dataSharingStatus = fetchStatus.body;
                        user.status.profilestat = true;
                        user.status.emailConfirmStatus = true;
                        user.status.pendingauthStatus = false;

                        user.save((err) => {
                            if (err) {
                                logger.error("requestId :: " + requestId + " :: newagreementStatus Controller Error in updating profile information-" + err);
                                return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "updateprofile"))
                            }
                            if (logLevel === "DEBUG")
                                logger.debug("requestId :: " + requestId + " :: newagreementStatus Controller Profile updation success");
                            return res.status(200).send(mapError.errorCodeToDesc(requestId, '205', "updateprofile"));
                        });
                    } else if (fetchStatus.body.agreementStatusList[0].status == "Pending - Customer Authorization") {
                        if (logLevel === "DEBUG")
                            logger.debug("requestId :: " + requestId + " :: newagreementStatus Controller SMT sent Pending Authorization status");

                        user.status.pendingauthStatus = true;
                        user.save((err) => {
                            if (err) {
                                logger.error("requestId :: " + requestId + " :: newagreementStatus Controller Error in updating Pending status-" + err);
                                return res.status(200).send(mapError.errorCodeToDesc(requestId, '501', "updateprofile"))
                            }
                            if (logLevel === "DEBUG")
                                logger.debug("requestId :: " + requestId + " :: newagreementStatus Controller Profile updation success");
                            return res.status(200).send(mapError.errorCodeToDesc(requestId, '203', "updateprofile"));
                        });
                    } else {
                        logger.debug("requestId :: " + requestId + " :: newagreementStatus Controller User have not acknowledged the Data Sharing agreement");
                        return res.status(200).send(mapError.errorCodeToDesc(requestId, '404', "new_agreement_status"));

                    }
                }

            ])
        }

    }).catch((error) => {
        logger.error("requestId :: " + requestId + " :: newagreementStatus user search Exception -" + error);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "getprofile"))
    });
};
















//Payload for getting the Customer Premise Information as per SMT Doc
/*{
    "trans_id": "123",
    "requestorID": "SUMANTH_CSP",
    "requesterType": "CSP",
    "requesterAuthenticationID":"199999999999",
    "deliveryMode": "EML",
    "version": "L",
    "esiid": [
    "10443720008107413",
    "10443720007526004"
    ],
    "SMTTermsandConditions": "Y"
}*/

exports.premiseinfo = function (req, res) {
    const requestId = req.id;
    const logger = getLogger('premiseinfo');

    co(function* () {

        if (logLevel === "DEBUG") {
            logger.debug("premiseinfo controller Start");
        }

        var param = {};
        param.trans_id = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss');
        param.requestId = req.id;
        param.esiid = req.body.esiid;


        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: premiseinfo Controller ::  Query -" + JSON.stringify(param));
        var fetchObj = new premiseInfoService(param);
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: premiseinfo Controller :: going to fetch from SMT ");
        var fetchStatus = yield fetchObj.getPremiseDetails();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: premiseinfo  Controller :: SMT returned premise details as  - " + JSON.stringify(fetchStatus));
        res.send(fetchStatus)
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + ":: premiseinfo  Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
        res.status(500).send(err)
    });
};


//Payload for getting the Customer Premise Information as per SMT Doc
/*{
  "trans_id": "123",
  "requestorID": "SUMANTH_CSP",
  "requesterType": "CSP",
  "requesterAuthenticationID": "199999999999",
  "reportFormat": "CSV",
  "version": "L",
  "ESIIDMeterList": [
    {
      "esiid": "10443720008107413"
    }
  ],
  "SMTTermsandConditions": "y"
}*/

exports.meterinfo = function (req, res) {
    const requestId = req.id;
    const logger = getLogger('meterinfo');

    co(function* () {

        if (logLevel === "DEBUG") {
            logger.debug("meterinfo controller Start");
        }

        var param = {};
        param.trans_id = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss');
        param.requestId = req.id;
        param.esiid = req.body.esiid;


        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: meterinfo Controller ::  Query -" + JSON.stringify(param));
        var fetchObj = new meterinfoService(param);
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: meterinfo Controller :: going to fetch from SMT ");
        var fetchStatus = yield fetchObj.getMeterDetails();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: meterinfo  Controller :: SMT returned meter details as  - " + JSON.stringify(fetchStatus));
        res.send(fetchStatus)
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + ":: meterinfo  Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
        res.status(500).send(err)
    });
};