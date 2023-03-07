let co = require('co');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
let apiDetails = require(path.join(appRoot, '/api/config/settings.js'));
let monthlyreadService = require(path.join(appRoot, '/api/services/smt-service/monthly-read-service.js'));
const User = require(path.join(appRoot, 'api/models/User'));

let moment = require('moment');
let _ = require("lodash");
const { lte } = require('lodash');

exports.scalarusage = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('scalarusage');

    try {
        const usage = req.body.usage;
        const month = req.body.month;
        
        const scalarrefarr=apiDetails.SCALARREF.scales;
        let usagearr=[]
        scalarrefarr.forEach(function (refobj){
            var scusage=(parseFloat(usage)/scalarrefarr[parseInt(month)-1].scalarindex)*refobj.scalarindex
            usagearr.push(Math.round(scusage))
        })
        let response={
            predictedusage:usagearr
        }  
        
        logger.debug("requestId :: " + requestId + " :: scalarusage Predicted usage for the year -" + JSON.stringify(response));
        res.send(response)
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: scalarusage Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "scalarusage"))
    }
};


exports.scalarmonthyear_without_smt_depreciated = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('scalarmonthyear');

    try {
        const usage = req.body.usage;
        const month = req.body.month;
        const year = new Date().getFullYear()

        
        const scalarrefarr=apiDetails.SCALARREF.scales;
        let usagearr=[]
        //Calculate the 
        scalarrefarr.forEach(function (refobj){
            var scusage=(parseFloat(usage)/scalarrefarr[parseInt(month)-1].scalarindex)*refobj.scalarindex
            var respObj={
                'usage':Math.round(scusage),
                'month':refobj.month,
            }
            if(refobj.ind>=parseInt(month) && refobj.ind<=12){
                respObj.year=year,
                respObj.sortIndex=parseInt(refobj.ind.toString()+year.toString())
            }else{
                respObj.year=year+1,
                respObj.sortIndex=parseInt(refobj.ind.toString()+(year+1).toString())
            }
 
            usagearr.push(respObj)
        })
        //predictedusage:usagearr.sort((a, b) => (a.sortIndex > b.sortIndex) ? 1 : -1)


        let sortedusage=usagearr.sort((a, b) => (a.year > b.year) ? 1 : (a.year === b.year) ? ((a.sortIndex > b.sortIndex) ? 1 : -1) : -1 )
        logger.debug("requestId :: " + requestId + " :: scalarmonthyear usage after sorting -" + JSON.stringify(sortedusage));

        let finalresp=[];
        sortedusage.forEach(function (refobj){
            //logger.debug("requestId :: " + requestId + " :: scalarmonthyear removing sort index for  -" + JSON.stringify(refobj));
            delete refobj["sortIndex"]
            //logger.debug("requestId :: " + requestId + " :: scalarmonthyear trimmed object is   -" + JSON.stringify(refobj));
            finalresp.push(refobj)
        })

        let response ={
            'predictedusage':finalresp
        }  
        
        logger.debug("requestId :: " + requestId + " :: scalarmonthyear Predicted usage for the year -" + JSON.stringify(response));
        res.send(response)
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: scalarmonthyear Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "scalarusage"))
    }
};







function nonusagefromsmt (id, usage_in,month_in) {
    var requestId = id;
    const logger = getLogger('nonusagefromsmt');

    try {
        const usage = usage_in;
        const month = month_in;
        const year = new Date().getFullYear()

        
        const scalarrefarr=apiDetails.SCALARREF.scales;
        let usagearr=[]
        //Calculate the 
        scalarrefarr.forEach(function (refobj){
            var scusage=(parseFloat(usage)/scalarrefarr[parseInt(month)-1].scalarindex)*refobj.scalarindex
            var respObj={
                'usage':Math.round(scusage),
                'month':refobj.month,
            }
            if(refobj.ind>=parseInt(month) && refobj.ind<=12){
                respObj.year=year,
                respObj.sortIndex=parseInt(refobj.ind.toString()+year.toString())
            }else{
                respObj.year=year+1,
                respObj.sortIndex=parseInt(refobj.ind.toString()+(year+1).toString())
            }
 
            usagearr.push(respObj)
        })
        //predictedusage:usagearr.sort((a, b) => (a.sortIndex > b.sortIndex) ? 1 : -1)


        let sortedusage=usagearr.sort((a, b) => (a.year > b.year) ? 1 : (a.year === b.year) ? ((a.sortIndex > b.sortIndex) ? 1 : -1) : -1 )
        logger.debug("requestId :: " + requestId + " :: nonusagefromsmt usage after sorting -" + JSON.stringify(sortedusage));

        let finalresp=[];
        sortedusage.forEach(function (refobj){
            delete refobj["sortIndex"]
            finalresp.push(refobj)
        })

        let response ={
            'predictedusage':finalresp
        }  
        
        logger.debug("requestId :: " + requestId + " :: nonusagefromsmt Predicted usage for the year -" + JSON.stringify(response));
        return (response)
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: nonusagefromsmt Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "scalarusage"))
    }
};



exports.scalarmonthyear= function (req, res) {
    var requestId = req.id;
    const logger = getLogger('fetchusagefromsmt');
    var param = {};


    // try {
    const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;

    var queryPayload = { "token.token": authtoken };
    logger.debug("requestId :: " + requestId + ":: Query payload for scalarmonthyear -" + JSON.stringify(queryPayload));

    //User.findOne(queryPayload).then(function (err,user) {
    User.findOne(queryPayload, (err, user) => {
        if (!user) {
            logger.error("requestId :: " + requestId + ":: No user found with logged token  -" + authtoken);
            res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "getprofile"))
        
        }else if (user.status.pendingauthStatus===true){
            logger.error("requestId :: " + requestId + ":: User prndingstatus is  -" + user.status.pendingauthStatus);
            const usage = req.body.usage;
            const month = req.body.month;
            res.send(nonusagefromsmt(requestId,usage,month))
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
                    logger.debug("requestId :: " + requestId + ":: scalarmonthyear Controller ::  Query -" + JSON.stringify(param));
                var readObj = new monthlyreadService(param);
                if (logLevel === "DEBUG")
                    logger.debug("requestId :: " + requestId + ":: scalarmonthyear Controller :: Fetching from SMT ");
                var fetchStatus = yield readObj.fetchFromSMT();
                if (fetchStatus.billingdata.length < 1) {
                    logger.debug("requestId :: " + requestId + ":: scalarmonthyear Controller :: SMT returned no data found");
                    //res.send(fetchStatus)
                    const usage = req.body.usage;
                    const month = req.body.month;
                    res.send(nonusagefromsmt(requestId,usage,month))
                } else {

                    //Start of Scalar Algo
                    const usage = req.body.usage;

                    //Get the Start month SMT returned
                    //const month_splitted = fetchStatus.billingdata[0].endDate.split("/");
                    const month_splitted = fetchStatus.billingdata[0].startDate.split("/");

                    const start_month = parseInt(month_splitted[0])
                    logger.debug("requestId :: " + requestId + " :: Start month is -" + start_month);

                   // const last_month_splitted = fetchStatus.billingdata[fetchStatus.billingdata.length - 1].endDate.split("/");
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

                        ///var scusage = (parseFloat(uniquearr[uniquearr.length - 1].actualkWh) / scalarrefarr[parseInt(uniquearr.length - 1) - 1].scalarindex) * refobj.scalarindex
                        var scusage = (parseFloat(usage) / scalarrefarr[parseInt(uniquearr.length - 1) - 1].scalarindex) * refobj.scalarindex

                        /* if(skip_index==0){
                            skip_index++;
                            return;
                        }*/

                        var respObj={
                            'usage':Math.round(scusage),
                            'month':refobj.month,
                            'monthindex':parseInt(refobj.ind)
                        }
                       // if(refobj.ind>=parseInt(month) && refobj.ind<=12){
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
                logger.debug("requestId :: " + requestId + " :: scalarmonthyear usage after sorting -" + JSON.stringify(sortedusage));
        
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
                
                logger.debug("requestId :: " + requestId + " :: scalarmonthyear Predicted usage for the year -" + JSON.stringify(response));
                res.send(response)
            }

                //End of Scalar Algo
            }).catch(function (err) {
                logger.error("requestId :: " + requestId + ":: scalarmonthyear Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
                res.status(500).send(err)
            });

        }

    }).catch((error) => {
        logger.error("requestId :: " + requestId + " :: scalarmonthyear user search Exception -" + error);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "getprofile"))
    });
    /*    } catch (err) {
            logger.error("requestId :: " + requestId + " :: fetchusagefromsmt Exception -" + err);
            return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "getprofile"))
        }*/
};
