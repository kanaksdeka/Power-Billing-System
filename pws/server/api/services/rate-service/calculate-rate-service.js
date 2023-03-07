var co = require('co');
var path = require('path');
var _ = require("lodash");
var schema = require("schemajs");
var appRoot = path.join(require('app-root-dir').get(), '/server/');
var crud = require(path.join(appRoot, '/api/services/dao-mongo/crud/crud_operations.js'));
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
//let sql_config = require(path.join(appRoot,'/api/config/constant_sql.js'));
var apiDetails = require(path.join(appRoot, '/api/config/settings.js'));
var theRestCall = require(path.join(appRoot, 'utils/rest-call.js'));
let plan = require(path.join(appRoot, '/api/models/Plan'));
let insert_ref = require(path.join(appRoot, '/api/models/Sequence'));
let zip2tduModel = require(path.join(appRoot, '/api/models/Zip2TDU'));

let moment=require('moment');


var logger = getLogger('calculate_rate_service');

function calculate_rate_service(param) {
    this.params = {};
    this.area_code=parseInt(param.areaCode);
    this.requestId =param.requestId;
    this.email=param.email;
    this.usage=parseFloat(param.usage);
    this.planType= param.planType.toLowerCase();
}

calculate_rate_service.prototype.init = function () {
}


calculate_rate_service.prototype.validateInputPayload = function () {
    var self = this;

    if (logLevel === "DEBUG")
        logger.debug("requestId :: " + self.requestId + ":: validateInputPayload :: Called");

    var model = schema.create({
        areaCode: {
            type: "number",
            required: true
        },
        email: {
            type: "email",
            filters: "trim",
            required: false,           
       },
        usage: {
            type: "number",
            required: true,
            properties: {min:1,max:10000}

        },
        planType:{
            type: "string",
            required: true,
            pattern:"^[dpr]",
            properties: {
                min:1,
                max:1
              
            }
        }
    });
    var validate = model.validate({
        areaCode: self.area_code,
        email: self.email,
        usage: self.usage,
        planType:self.planType
    });

    if (logLevel === "DEBUG") {
        logger.info("requestId :: " + self.requestId + ":: validating for -" + JSON.stringify(validate));
        logger.info("requestId :: " + self.requestId + ":: validateInputPayload :: Returning -" + validate.valid);
    }

    return validate.valid;

}


calculate_rate_service.prototype.getRefTime = function () {
    let self = this;
    self.params.ref="";
    return new Promise(function (resolve, reject) {
        co(function* () {
            logger.debug("requestId :: " + self.requestId + " :: Inside getRefTime ");
            let queryPayload = {
                "key":"1"
            }

            var fetchInsertRef = yield crud.getOne('insertrefs',insert_ref,queryPayload, self.requestId,'getRefTime') 
            logger.debug("requestId :: " + self.requestId + " :: insertRefTime insertResp -"+JSON.stringify(fetchInsertRef));
            self.params.ref=fetchInsertRef[0].insert_ref;
            resolve(self.params.ref);
        }).catch(function (err) {
            logger.error("requestId :: " + self.requestId + " :: InsertRefTime Error -" + err);
            reject(err);
        })
    });

}


calculate_rate_service.prototype.bestRates= function () {
    let self = this;
    return new Promise(function (resolve, reject) {
        co(function* () {
            //get all the TDU's for the provided zip
            let queryPayload = {
                "zip":self.area_code
            }
            logger.debug("requestId :: " + self.requestId + " :: bestRates queryPayload -"+JSON.stringify(queryPayload));

            var fetchTdu = yield crud.getOne('zip2tdus',zip2tduModel,queryPayload, self.requestId,'bestRates') 
            logger.debug("requestId :: " + self.requestId + " :: bestRates fetchTdu -"+JSON.stringify(fetchTdu));

            var returnObj=fetchTdu[0];

            if(returnObj && Object.keys(returnObj).length > 0){
          
               tdu_ref=fetchTdu[0];

                var tdu_array=[];
                var found=1

                //Filter out the TDU to consider for the ZIP
                if(tdu_ref.tcc==1){
                    tdu_array.push("ATCC");
                    logger.debug("requestId :: " + self.requestId + " :: bestRates ATCC Inserting");

                }
                if(tdu_ref.tnc==1){
                    tdu_array.push("ATNC");
                    logger.debug("requestId :: " + self.requestId + " :: bestRates ATNC Inserting");
                    found=2;
                }
                if(tdu_ref.cp==1){
                    tdu_array.push("CP");
                    logger.debug("requestId :: " + self.requestId + " :: bestRates CP Inserting");
                    found=3;

                }
                if(tdu_ref.onc==1){
                    tdu_array.push("OEDC");
                    logger.debug("requestId :: " + self.requestId + " :: bestRates OEDC Inserting");
                    found=4;

                }
                if(tdu_ref.nmpc==1){
                    tdu_array.push("TMPC");
                    logger.debug("requestId :: " + self.requestId + " :: bestRates TMPC Inserting");
                    found=4;

                }
                if(found>1){
                    logger.debug("requestId :: " + self.requestId + " :: bestRates TDU to  ZIP found - "+JSON.stringify(tdu_array));
                }
                else{
                    logger.debug("requestId :: " + self.requestId + " :: bestRates No TDU found for the ZIP ");
                    found=0;
                }

                if(found!=0){
                    logger.debug("requestId :: " + self.requestId + " :: bestRates TDU servicing the ZIP -"+self.area_code + " TDU -"+JSON.stringify(tdu_array));
                    //Now form the Query to fetch the rates for the TDU 
                    //logger.debug("Test -"+JSON.stringify(apiDetails.TDU['ATNC'].id))
                    let tdu_id_arr=[];
                    for(var i=0;i<tdu_array.length;i++){
                        logger.debug("TDU["+tdu_array[i]+"] -"+JSON.stringify(apiDetails.TDU[tdu_array[i]].id))
                        tdu_id_arr.push(apiDetails.TDU[tdu_array[i]].id);
                    
                    }
                    let queryPayload={};
                    if(self.planType=='d'|| self.planType!='p' || self.planType!='r' ){

                            queryPayload={
                                "plan_type":1,
                                $and: [ 
                                        { "createRef":self.params.ref},
                                    //  {"zip_code":self.area_code},
                                        {"minimum_usage":false},
                                        { "prepaid": 0 },
                                        { "timeofuse": false },
                                        //{ "new_customer":false},
                                        { "term_value": { $gte:12}},
                                        { "rating_total": { $gte:3}},
                                        { "company_tdu_id": { $in:tdu_id_arr } } 
                                ] 
                        }
                    }// Default query
                    if(self.planType=='p'){

                            queryPayload={
                                "plan_type":1,
                                $and: [ 
                                        { "createRef":self.params.ref},
                                    //  {"zip_code":self.area_code},
                                        {"minimum_usage":false},
                                        { "prepaid": 0 },
                                        { "timeofuse": false },
                                       // { "rating_total": { $gte:3}},
                                        { "company_tdu_id": { $in:tdu_id_arr } } 
                                ] 
                        }
                    }//Promotional
                    if(self.planType=='r'){

                        queryPayload={
                            "plan_type":1,
                            $and: [ 
                                    { "createRef":self.params.ref},
                                //  {"zip_code":self.area_code},
                                    {"minimum_usage":false},
                                    { "prepaid": 0 },
                                    { "timeofuse": false },
                                    { "new_customer":false},
                                    { "term_value": { $gte:12}},
                                    {  "renewable_energy_id": { $gte:15}},
                                    { "company_tdu_id": { $in:tdu_id_arr } } ,
                                    { "rating_total": { $gte:3}}
                            ] 
                    }
                }//Renewable

                if(logger.debug){
                    logger.debug("requestId :: " + self.requestId + " :: bestRates queryPayload for type -"+self.planType)
                    logger.debug("requestId :: " + self.requestId + " :: bestRates queryPayload -"+JSON.stringify(queryPayload))
                }
                var matchingPlan = yield crud.getOne('plans',plan,queryPayload, self.requestId,'bestRates');
                let optimal_rates=[]

                matchingPlan.forEach(function (plan) {
                    let calculated={};

                    switch(plan.company_tdu_id) {
                        case apiDetails.TDU.ATCC.id:
                            calculated.total_charge=self.usage*(parseFloat(apiDetails.TDU.ATCC.TDU_VAR_RATE) + plan.rep_var_rate) + (parseFloat(apiDetails.TDU.ATCC.TDU_BASE_RATE) +plan.rep_base_rate)
                            calculated.tdu_base_rate=apiDetails.TDU.ATCC.TDU_BASE_RATE
                            calculated.tdu_var_rate=apiDetails.TDU.ATCC.TDU_VAR_RATE
                            break;
                        case apiDetails.TDU.ATNC.id:
                            calculated.total_charge=self.usage*(parseFloat(apiDetails.TDU.ATNC.TDU_VAR_RATE) + plan.rep_var_rate) + (parseFloat(apiDetails.TDU.ATNC.TDU_BASE_RATE) +plan.rep_base_rate)
                            calculated.tdu_base_rate=apiDetails.TDU.ATNC.TDU_BASE_RATE
                            calculated.tdu_var_rate=apiDetails.TDU.ATNC.TDU_VAR_RATE
                            break;
                        case apiDetails.TDU.CP.id:
                            calculated.total_charge=self.usage*(parseFloat(apiDetails.TDU.CP.TDU_VAR_RATE) + plan.rep_var_rate) + (parseFloat(apiDetails.TDU.CP.TDU_BASE_RATE) +plan.rep_base_rate)
                            calculated.tdu_base_rate=apiDetails.TDU.CP.TDU_BASE_RATE
                            calculated.tdu_var_rate=apiDetails.TDU.CP.TDU_VAR_RATE
                            break;
                        case apiDetails.TDU.OEDC.id:
                            calculated.total_charge=self.usage*(parseFloat(apiDetails.TDU.OEDC.TDU_VAR_RATE) + plan.rep_var_rate) + (parseFloat(apiDetails.TDU.OEDC.TDU_BASE_RATE) +plan.rep_base_rate)
                            calculated.tdu_base_rate=apiDetails.TDU.OEDC.TDU_BASE_RATE
                            calculated.tdu_var_rate=apiDetails.TDU.OEDC.TDU_VAR_RATE
                            break;
                        case apiDetails.TDU.TMPC.id:
                            calculated.total_charge=self.usage*(parseFloat(apiDetails.TDU.TMPC.TDU_VAR_RATE) + plan.rep_var_rate) + (parseFloat(apiDetails.TDU.TMPC.TDU_BASE_RATE) +plan.rep_base_rate)
                            calculated.tdu_base_rate=apiDetails.TDU.TMPC.TDU_BASE_RATE
                            calculated.tdu_var_rate=apiDetails.TDU.TMPC.TDU_VAR_RATE
                            break;
                        default:
                            logger.debug("requestId :: " + self.requestId + " :: insert :: Future Block ....");
                        }
                        calculated.total_charge=Math.round(calculated.total_charge*100000)/100000
                        calculated.plan_id=plan.plan_id;
                        calculated.rep_base_rate=plan.rep_base_rate;
                        calculated.rep_var_rate=plan.rep_var_rate;
                       // calculated.zip_code=plan.zip_code;
                        calculated.term_value=plan.term_value;
                        calculated.company_name=plan.company_name;
                        calculated.company_logo=plan.company_logo;
                       // calculated.company_tdu_id=plan.company_tdu_id;
                        calculated.website=plan.website;
                        calculated.plan_name=plan.plan_name;

                        //Added additional parameters
                        calculated.price_kwh500=plan.price_kwh500;
                        calculated.price_kwh1000=plan.price_kwh1000;
                        calculated.price_kwh2000=plan.price_kwh2000;
                        calculated.price_kwh2000=plan.price_kwh2000;
                        calculated.special_terms=plan.special_terms;
                        calculated.enroll_phone=plan.enroll_phone;
                        calculated.fact_sheet=plan.fact_sheet;
                        calculated.terms_of_service=plan.terms_of_service;
                        calculated.pricing_details=plan.pricing_details; //Cancellation charages
                        calculated.rating_total=plan.rating_total;
                       
                        calculated.renewable_energy_id=plan.renewable_energy_id +"%";


                       /* if(self.planType=='r'){
                            calculated.renewable_energy_id=plan.renewable_energy_id +"%";
                        }*/


                        optimal_rates.push(calculated);

                    });
                    //resolve(optimal_rates);
                    var sorted_rates=optimal_rates.sort((a, b) => parseFloat(a.total_charge) - parseFloat(b.total_charge))
                    var _unique_plan = _.uniqBy(sorted_rates, 'plan_id'); 
                
                    //Now convert the data to 2 Decimal 
                    var final_converted_arr=[];
                    for(var i=0;i<_unique_plan.length;i++)
                    {
                        if(i==300){
                            logger.debug("requestId :: " + self.requestId + " :: Reached Limit of 36 existing ");
                            break;
                        }
                        var final_plan=_unique_plan[i];
                            final_plan.total_charge=Math.round(_unique_plan[i].total_charge*100)/100
                            final_plan.company_logo=_unique_plan[i].company_logo.replace("http://", "https://");
                            final_converted_arr.push(final_plan);
                    }

                    //Filtering only the top two per provider
                    var unique = [];
                    var distinct = [];
                    var toptwo=[];
                    for( let i = 0; i < final_converted_arr.length; i++ ){
                      if( !unique[final_converted_arr[i].company_name]){
                         var count = distinct.reduce(function(n, val) {
                            return n + (val === final_converted_arr[i].company_name);
                        }, 0);
                        if(count<3){
                            //distinct.push(array[i].company_name);
                            //console.log("Pushing in -"+final_converted_arr[i].company_name)
                            distinct.push(final_converted_arr[i].company_name);
                            toptwo.push(final_converted_arr[i])

                        }else{
                           // console.log("Max received for -"+final_converted_arr[i].company_name)
                            unique[final_converted_arr[i].company_name] = 1;
                        }
                      }
                    }


                   //resolve(final_converted_arr);
                   // resolve(_unique_plan);
                   resolve(toptwo)
                }else{
                    logger.error("requestId :: " + self.requestId + " :: bestRates Error -" + err);
                    reject(mapError.errorCodeToDesc(self.requestId, '501','bestRates'));
                }
            }else{
                logger.debug("requestId :: " + self.requestId + " :: bestRates Zip not found ");
                reject(mapError.errorCodeToDesc(self.requestId, '502','bestRates'));
            }
                
        }).catch(function (err) {
            logger.error("requestId :: " + self.requestId + " :: bestRates Error -" + err);
            reject(err);
        })
    });

}




module.exports = calculate_rate_service;
