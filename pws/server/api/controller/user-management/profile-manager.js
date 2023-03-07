let path = require('path');
const co = require('co');
const async = require('async');
let moment = require("moment");

let appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
// our persistent user model
const User = require(path.join(appRoot, 'api/models/User'));
let fetchesiidService = require(path.join(appRoot, '/api/services/esiid-service/address-to-esiid-service.js'));
let meterinfoService = require(path.join(appRoot, '/api/services/smt-service/meter-info-service.js'));
let newAgreementService = require(path.join(appRoot, '/api/services/smt-service/new-agreement-service.js'));

var _ = require("lodash");

exports.updateprofile = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('updateprofile');
    let esiid_change = false;
    let meter_change = false;
    let provider_change=false;


    try {
        const updateData = req.body.update;
        const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;


        if (!updateData) {
            logger.error("requestId :: " + requestId + ":: please provide what you want to update ");
            res.status(422).send(mapError.errorCodeToDesc(requestId, '422', "updateprofile"))
        } else {
            logger.debug("requestId :: " + requestId + ":: Update payload for profile update -" + JSON.stringify(updateData));

        }
        var queryPayload = { "token.token": authtoken };
       // logger.debug("requestId :: " + requestId + ":: Query payload for profile update -" + JSON.stringify(queryPayload));

        //User.findOne(queryPayload).then(function (err,user) {
        User.findOne(queryPayload, (err, user) => {
            if (!user) {
                logger.error("requestId :: " + requestId + ":: No user found with logged token ");
                res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "updateprofile"))
            } else {
                logger.debug("requestId :: " + requestId + ":: User found with email -" + user.email);
            }

            //NOTE  only update fields that were actually passed...
            if (updateData.hasOwnProperty("email") && typeof updateData.email != 'undefined' && updateData.email.length>0) {
                //user.email = updateData.email;
            }
            if (updateData.hasOwnProperty("firstname") && typeof updateData.firstname != 'undefined' && updateData.firstname.length>0) {
                user.profile.firstName = updateData.firstname;
            }
            if (updateData.hasOwnProperty("lastname") && typeof updateData.lastname != 'undefined' && updateData.lastname.length>0) {
                user.profile.lastName = updateData.lastname;
            }
            if (updateData.hasOwnProperty("esiid") && typeof updateData.esiid != 'undefined' && updateData.esiid.length>0) {
                user.profile.esiid = updateData.esiid.trim();
                esiid_change = true;
            }

            if (updateData.hasOwnProperty("meterid") && typeof updateData.meterid != 'undefined' && updateData.meterid.length>0) {
                user.profile.meterid = updateData.meterid.trim();
                meter_change = true
            }
            if (updateData.hasOwnProperty("contractendingon") && typeof updateData.contractendingon != 'undefined' && updateData.contractendingon.length>0) {
               // user.profile.contractendingon = updateData.contractendingon;
               //user.profile.contractendingon = moment(updateData.contractendingon, 'MM-DD-YYYY HH:mm:ss ZZ').toDate();
               user.profile.contractendingon = new Date(updateData.contractendingon);
            }
            if (updateData.hasOwnProperty("currentprovider") && typeof updateData.currentprovider != 'undefined' && updateData.currentprovider.length>0) {
                user.profile.currentprovider = updateData.currentprovider.trim();
                provider_change = true;

            }

            if (updateData.hasOwnProperty("zipcode") && typeof updateData.zipcode != 'undefined' && updateData.zipcode.length>0) {
                user.profile.address.zipcode = updateData.zipcode;
            }

            /*if (updateData.hasOwnProperty("address") && typeof updateData.address.address != 'undefined' && updateData.address.address.length>0) {
                user.profile.address.address = updateData.address.address;
            }

            if (updateData.hasOwnProperty("address") && typeof updateData.address.duration != 'undefined' && updateData.address.duration>0) {
                user.profile.address.duration = updateData.address.duration;
            }

            if (updateData.hasOwnProperty("address") && typeof updateData.address.premisetype != 'undefined' && updateData.address.premisetype.length>0) {
                user.profile.address.residenceType = updateData.address.premisetype;
            }
            */
            if (updateData.hasOwnProperty("apartmentNumber") && typeof updateData.apartmentNumber != 'undefined' && updateData.apartmentNumber.length>0) {
                user.profile.address.apartmentNumber = updateData.apartmentNumber;
            }

            async.waterfall([
                function triggerdatasharing(done) {
                    if (esiid_change == true || meter_change == true || provider_change==true) {
                        logger.debug("requestId :: " + requestId + " :: updateprofile Controller going to trigger SMT data sharing ");

                        var param = {};

                        co(function* () {

                            if (logLevel === "DEBUG") {
                                logger.debug("newagreement controller Start");
                            }

                            param.trans_id = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss');
                            param.requestId = req.id;
                            param.email = user.email;
                            param.duration = user.duration;
                            param.meternumber = user.profile.meterid.trim();
                            param.puctrornumber = parseInt(user.profile.currentprovider.trim());
                            param.duration = user.profile.address.duration;

                            param.esiid = user.profile.esiid.trim();
                            if (esiid_change == true){
                                param.esiidfetched = true
                            }
                            if (meter_change == true){
                                param.meterfetched = true
                            }


                            if (logLevel === "DEBUG")
                                logger.debug("requestId :: " + requestId + ":: Query -" + JSON.stringify(param));
                            var agreementObj = new newAgreementService(param);
                            if (logLevel === "DEBUG")
                                logger.debug("requestId :: " + requestId + ":: registering with SMT ");
                            let agreeStatus = yield agreementObj.agree();
                            //let agreeStatus={"statusCode":200,"headers":{"x-backside-transport":"OK OK,OK OK","connection":"close","transfer-encoding":"chunked","x-original-http-status-code":"200","content-type":"application/json","date":"Fri, 29 May 2020 20:10:20 GMT","x-global-transaction-id":"196c55655ed16c2900ac37a3"},"body":{"trans_id":"05302020014220","agreementNumber":"99862","statusCode":"ACK","statusReason":"Success"}}
                            if (logLevel === "DEBUG")
                                logger.debug("requestId :: " + requestId + ":: SMT returned ack as  - " + JSON.stringify(agreeStatus));
                            // res.send(agreeStatus)
                            //done(null, agreeStatus);
                            user.status.esiidfetched=true
                            user.status.meterfetched=true
                            user.status.profilestat=false
                            user.status.emailConfirmStatus = false;
                            user.status.pendingauthStatus = true;

                            user.status.dataSharingStatus = agreeStatus.body;
                            done(null, user)
                        }).catch(function (err) {
                            logger.error("requestId :: " + requestId + ":: updateprofile Controller SMT Exception -" + err + ": JSON Error -" + JSON.stringify(err));
                            //res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateprofile"))
                            res.send(err)
                        });
                    } else {
                        logger.debug("requestId :: " + requestId + " :: updateprofile Controller callign update without SMT call ");
                        done(null, user)
                    }
                },
                function update_profile(user, done) {
                    if (logLevel === "DEBUG")   
                        logger.debug("requestId :: " + requestId + " :: updateprofile Controller inside update_profile");
                    user.save((err) => {
                        if (err) {
                            logger.error("requestId :: " + requestId + " :: updateprofile Controller Error in updating profile information-" + err);
                            return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "updateprofile"))
                        }
                        if (logLevel === "DEBUG")
                            logger.debug("requestId :: " + requestId + " :: updateprofile Controller Profile updation success");
                        return res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "updateprofile"));
                    });
                }
            ])

        }).catch((error) => {
            logger.error("requestId :: " + requestId + " :: updateprofile find and update Exception -" + error);
            res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateprofile"))
        });

    } catch (err) {
        logger.error("requestId :: " + requestId + " :: updateprofile Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "updateprofile"))
    }
};



// This API fetches the ESIID and Meter Info given a addresss reads from http://apis.esiids.com/


exports.completeprofile = function (req, res) {
    const requestId = req.id;
    const logger = getLogger('completeprofile');
    let fetchStatus = {};
    //let agreeStatus = {};
    let response = [];
    let combined = {};
    var param = {};


    co(function* () {

        if (logLevel === "DEBUG") {
            logger.debug("completeprofile controller Start");
        }

        param.requestId = req.id;
        param.address = typeof req.body.address != "undefined" && req.body.address.length > 0 ? req.body.address : "";
        param.zipcode = typeof req.body.zipcode != "undefined" && req.body.zipcode > 0 ? req.body.zipcode : 0;
        param.premise_type = typeof req.body.premise_type != "undefined" && req.body.premise_type.length > 0 ? req.body.premise_type : "";
        param.apartmentNumber = typeof req.body.apartmentNumber != "undefined" && req.body.apartmentNumber.length > 0 ? req.body.apartmentNumber : "";
        param.iseditcalled=typeof req.body.iseditcalled != "undefined" && req.body.iseditcalled.length > 0 ? req.body.iseditcalled : false;


        const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;


        let esiiObj = new fetchesiidService(param);
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: completeprofile Controller ::  Query -" + JSON.stringify(param));
        let inputValidation = false;
        let residenceValidation = false;
        inputValidation = yield esiiObj.validateAddressPayload();
        residenceValidation = yield esiiObj.validateResidencePayload();

        let validStatus = yield esiiObj.validateZipCode();
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: completeprofile Controller ::  ZIP Code found");

        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: completeprofile Controller :: Fetching from ESIID ");
        fetchStatus = yield esiiObj.fetchesiid();
        // fetchStatus={"address":[{"meter_id":"1008901023901266050117","address":"8606 BROOKDALE PARK LN","address_2":"","city":"RICHMOND","state":"TX","zip":"77407","plus4":"0000","meter_read_cycle":"18","meter_status":"A","premise_type":"Residential","metered":"Y","power_region":"ERCOT","stationcode":"OB","stationname":"OBRIEN","tdsp_duns":"957877905","polr_customer_class":"Residential","smart_meter":"Y","tdsp_name":"CENTERPOINT","trans_count":"0","service_orders":"","tdsp_ams_indicator":"AMSR","switch_hold_indicator":"N"}]}
        //fetchStatus.address=""
        if (logLevel === "DEBUG")
            logger.debug("requestId :: " + requestId + ":: completeprofile Controller :: ESIID returned fetch as - " + JSON.stringify(fetchStatus));

        //Going to get the meter info from SMT now
        if (fetchStatus.address == "") {
            logger.debug("requestId :: " + requestId + ":: completeprofile Controller :: ESIID returning Address not found - " + JSON.stringify(fetchStatus));

            //Since ESIID is not returned for the provided Address, something is wrong still we go ahead and complete the profiel saving

            //const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;
            param.duration = typeof req.body.duration != "undefined" && req.body.duration > 0 ? req.body.duration : 12;
            param.meternumber = req.body.meternumber.trim();
            param.currentprovider = req.body.puctrornumber;
            param.contractendingon = req.body.contractendingon;
            param.esiidfetched = false

            logger.debug("requestId :: " + requestId + ":: Update payload for profile completion -" + JSON.stringify(param));
            let profileupdatestatus = yield updateuserrecord(param, requestId, authtoken)
            logger.debug("requestId :: " + requestId + ":: Profile completion status returned -" + JSON.stringify(profileupdatestatus));
            res.status(200).send(mapError.errorCodeToDesc(requestId, '201', 'updateprofile'));
        }


        if (fetchStatus.address.length > 1) {
            logger.debug("requestId :: " + requestId + ":: completeprofile Controller :: got multiple adress - " + JSON.stringify(fetchStatus));
            combined.address = fetchStatus.address;
            combined.meter = null;
            // response.push(combined);
            res.status(200).send(combined)
        }
        //else {
        if (fetchStatus.address.length ==1) {
            async.waterfall([

                function fetchemail(done){

                        //For data Sharig we need the email id

                        var queryPayload = { "token.token": authtoken };
                        logger.debug("requestId :: " + requestId + ":: Query payload for email fetch -" + JSON.stringify(queryPayload));
                
                        User.findOne(queryPayload, (err, user) => {
                            if (!user) {
                                logger.error("requestId :: " + requestId + ":: No user found with logged token  -" + authtoken);
                                res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "getprofile"))
                            } else {
                                logger.debug("requestId :: " + requestId + ":: User found with email -" + user.email);
                                done(null, user.email);
                            }
                
                        }).catch((error) => {
                            logger.error("requestId :: " + requestId + " :: getprofile find Exception -" + error);
                            res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "getprofile"))
                        });
                        //End of fetching emil id
                },
                function triggerdatasharing(email,done) {
                    const logger = getLogger('completeprofile::newagreement');
                    var param = {};

                    co(function* () {

                        if (logLevel === "DEBUG") {
                            logger.debug("newagreement controller Start");
                        }


                        param.trans_id = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss');
                        param.requestId = req.id;
                        param.email = email
                       // param.duration = typeof req.body.duration != "undefined" && req.body.duration > 0 ? req.body.duration : 12;
                        param.duration = 12;
                        param.meternumber = req.body.meternumber.trim();
                        param.puctrornumber = req.body.puctrornumber;
                        param.esiid = fetchStatus.address[0].meter_id.trim()
                        param.esiidfetched = true


                        if (logLevel === "DEBUG")
                            logger.debug("requestId :: " + requestId + ":: Query -" + JSON.stringify(param));
                        var agreementObj = new newAgreementService(param);
                        if (logLevel === "DEBUG")
                            logger.debug("requestId :: " + requestId + ":: registering with SMT ");
                        let agreeStatus = yield agreementObj.agree();
                        //let agreeStatus={"statusCode":200,"headers":{"x-backside-transport":"OK OK,OK OK","connection":"close","transfer-encoding":"chunked","x-original-http-status-code":"200","content-type":"application/json","date":"Fri, 29 May 2020 20:10:20 GMT","x-global-transaction-id":"196c55655ed16c2900ac37a3"},"body":{"trans_id":"05302020014220","agreementNumber":"99862","statusCode":"ACK","statusReason":"Success"}}
                        if (logLevel === "DEBUG")
                            logger.debug("requestId :: " + requestId + ":: SMT returned ack as  - " + JSON.stringify(agreeStatus));
                        // res.send(agreeStatus)
                        done(null, agreeStatus);
                    }).catch(function (err) {
                        logger.error("requestId :: " + requestId + ":: Exception -" + err + ": JSON Error -" + JSON.stringify(err));
                        if (err.errorCode_ == '500-AGSMT-001' && param.iseditcalled==false) {
                            logger.debug("requestId :: " + requestId + ":: Exception1 :: Going ahead with profile creation with the ESIID - " + param.esiid);
                            param.contractendingon = req.body.contractendingon;
                            param.currentprovider = req.body.puctrornumber;
                            param.meterfetched = false

                            delete param['meternumber'];
                            logger.debug("requestId :: " + requestId + ":: Exception1 :: Update payload for profile completion -" + JSON.stringify(param));
                            co(function* () {
                                let profileupdatestatus = yield updateuserrecord(param, requestId, authtoken)
                                res.status(200).send(mapError.errorCodeToDesc(requestId, '202', 'updateprofile'));

                            }).catch(function (err) {
                                logger.error("requestId :: " + requestId + ":: Exception1 ::  Update payload for profile completion -" + err + ": JSON Error -" + JSON.stringify(err));
                                res.status(500).send(err)
                            });
                            logger.debug("requestId :: " + requestId + ":: Exception1 :: Profile completion status returned -" + JSON.stringify(profileupdatestatus));
                        }else{
                            logger.debug("requestId :: " + requestId + ":: Complete profile called during sign up encountered an exception " + err + ": JSON Error -" + JSON.stringify(err));
                            res.status(500).send(err)
                        }
                    });
                },
                function updateprofile(agreeStatus, done) {
                    const logger = getLogger('completeprofile::updateprofile');

                    //const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;
                    var updateData = req.body;
                    var param = {};
                    param.address = req.body.address
                    param.zipcode = typeof req.body.zipcode != "undefined" && req.body.zipcode > 0 ? req.body.zipcode : 0;
                    param.premisetype = typeof req.body.premise_type != "undefined" && req.body.premise_type.length > 0 ? req.body.premise_type : "r";
                    param.apartmentNumber = typeof req.body.apartmentNumber != "undefined" && req.body.apartmentNumber.length > 0 ? req.body.apartmentNumber : "";


                    // param.email=req.body.email;
                    param.duration = typeof req.body.duration != "undefined" && req.body.duration > 0 ? req.body.duration : 12;
                    param.meternumber = req.body.meternumber;
                    param.currentprovider = req.body.puctrornumber;
                    param.contractendingon = req.body.contractendingon;
                    param.esiid = fetchStatus.address[0].meter_id;
                    param.meterfetched = true;
                    param.esiidfetched = true
                    param.dataSharingStatus = agreeStatus

                    logger.debug("requestId :: " + requestId + ":: Update payload for profile completion -" + JSON.stringify(param));
                    co(function* () {
                        let upprofilewithstatus = yield updateuserrecord(param, requestId, authtoken)
                        logger.debug("requestId :: " + requestId + ":: profile completion with status from SMT -" + JSON.stringify(upprofilewithstatus));
                      //  res.status(200).send(upprofilewithstatus)
                        let res_status={}
                        res_status.meter=param.meterfetched;
                        res_status.esiid=param.esiidfetched;
                        res_status.profilestat=false;
                        res.status(200).send(res_status)
                    }).catch(function (err) {
                        logger.error("requestId :: " + requestId + ":: Update payload for profile completion -" + err + ": JSON Error -" + JSON.stringify(err));
                        res.status(500).send(err)
                    });
                }
            ])
        }
    }).catch(function (err) {
        logger.error("requestId :: " + requestId + ":: completeprofile Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
        res.status(500).send(err)

    });
};

function updateuserrecord(param, requestId, authtoken) {
    const logger = getLogger('completeprofile::updateuserrecord');
    return new Promise(function (resolve, reject) {

        try {


            var queryPayload = { "token.token": authtoken };
            logger.debug("requestId :: " + requestId + ":: Query payload for profile update -" + JSON.stringify(queryPayload));

            //User.findOne(queryPayload).then(function (err,user) {
            User.findOne(queryPayload, (err, user) => {
                if (!user) {
                    logger.error("requestId :: " + requestId + ":: No user found with logged token  -" + authtoken);
                    res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "updateprofile"))
                } else {
                    logger.debug("requestId :: " + requestId + ":: User found with email -" + user.email);
                }

                //NOTE  only update fields that were actually passed...

                if (param.hasOwnProperty("esiid") && typeof param.esiid != 'undefined') {
                    user.profile.esiid = param.esiid.trim();
                }
                if (param.hasOwnProperty("meternumber") && typeof param.meternumber != 'undefined') {
                    user.profile.meterid = param.meternumber.trim();
                }
                if (param.hasOwnProperty("contractendingon") && typeof param.contractendingon != 'undefined') {
                   // user.profile.contractendingon = param.contractendingon;
                   //user.profile.contractendingon = moment(param.contractendingon, 'MM-DD-YYYY HH:mm:ss ZZ').toDate();
                   user.profile.contractendingon = new Date(param.contractendingon);
                   logger.error("requestId :: " + requestId + ":: contractendingon  -" + user.profile.contractendingon);
                }
                if (param.hasOwnProperty("currentprovider") && typeof param.currentprovider != 'undefined') {
                    user.profile.currentprovider = param.currentprovider;
                }

                if (param.hasOwnProperty("address") && typeof param.address != 'undefined') {
                    user.profile.address.address = param.address;
                }

                if (param.hasOwnProperty("zipcode") && typeof param.zipcode != 'undefined') {
                    user.profile.address.zipcode = param.zipcode;
                }

                if (param.hasOwnProperty("duration") && typeof param.duration != 'undefined') {
                    user.profile.address.duration = param.duration;
                }

                if (param.hasOwnProperty("premise_type") && typeof param.premise_type != 'undefined') {
                    user.profile.address.residenceType = param.premise_type;
                }
                if (param.hasOwnProperty("apartmentNumber") && typeof param.apartmentNumber != 'undefined') {
                    user.profile.address.apartmentNumber = param.apartmentNumber;
                }



                //Store the Data Sharing agreement Status
                if (param.hasOwnProperty("dataSharingStatus") && typeof param.dataSharingStatus != 'undefined') {
                    user.status.dataSharingStatus = param.dataSharingStatus.body;
                }
                if (param.hasOwnProperty("esiidfetched") && typeof param.dataSharingStatus != 'esiidfetched') {
                    user.status.esiidfetched = param.esiidfetched;
                }
                if (param.hasOwnProperty("meterfetched") && typeof param.dataSharingStatus != 'meterfetched') {
                    user.status.meterfetched = param.meterfetched;
                }


              //  if (logLevel === "DEBUG")
            //    logger.debug("requestId :: " + requestId + " :: payload for update -" + JSON.stringify(user));


                user.save((err) => {
                    if (err) {
                        logger.error("requestId :: " + requestId + " :: Error in updating profile information-" + err);
                        // return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "updateprofile"))
                        reject(mapError.errorCodeToDesc(requestId, '501', "updateprofile"))
                    }else{
                        if (logLevel === "DEBUG")
                           logger.debug("requestId :: " + requestId + " :: Profile updation success");
                           //return res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "updateprofile"));
                        resolve(mapError.errorCodeToDesc(requestId, '200', "updateprofile"))
                    }
                });

            }).catch((error) => {
                logger.error("requestId :: " + requestId + " :: find and update Exception -" + error);
                //res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "updateprofile"))
                reject(mapError.errorCodeToDesc(requestId, '500', "updateprofile"))
            });
        } catch (err) {
            logger.error("requestId :: " + requestId + " :: Exception -" + err);
            //return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "updateprofile"))
            reject(mapError.errorCodeToDesc(requestId, '502', "updateprofile"))
        }
    })
}



exports.getprofile = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('getprofile');

    try {
        const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;

        var queryPayload = { "token.token": authtoken };
        logger.debug("requestId :: " + requestId + ":: Query payload for profile fetch -" + JSON.stringify(queryPayload));

        //User.findOne(queryPayload).then(function (err,user) {
        User.findOne(queryPayload, (err, user) => {
            if (!user) {
                logger.error("requestId :: " + requestId + ":: No user found with logged token  -" + authtoken);
                res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "getprofile"))
            } else {
                res.send(200, {
                    //'token': token,
                    'email': user.email,
                    'profile': user.profile,
                    'status': {
                        'esiid': user.status.esiidfetched,
                        'meter': user.status.meterfetched,
                        'profilestat': user.status.profilestat,
                        'emailConfirmStatus':user.status.emailConfirmStatus,
                        'pendingauthStatus':user.status.pendingauthStatus
                    },
                });
                logger.debug("requestId :: " + requestId + ":: User found with email -" + user.email);
            }

        }).catch((error) => {
            logger.error("requestId :: " + requestId + " :: getprofile find Exception -" + error);
            res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "getprofile"))
        });
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: getprofile Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "getprofile"))
    }
};
