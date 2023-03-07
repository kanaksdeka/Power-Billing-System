/**
 * [appRouter Application routes]
 * @param  {[object]} app
 */
const co = require('co');
var path = require('path');
var _ = require("lodash");
var appRoot = path.join(require('app-root-dir').get());
let mapError = require(path.join(appRoot, '/server/utils/codeToErrorMapping.js'));
var crud = require(path.join(appRoot, '/server/api/services/dao-mongo/crud/CRUD.js'));
const User = require('../api/models/User');
var logger = getLogger('Authenticate');



function hasExpired(created) {
  var now = new Date();
  var diff = (now.getTime() - created);
  return diff > process.env.TTL
};

  /**
   * [Access token validation and fetches user information]
   * @param  {[object]}   req
   * @param  {[object]}   res
   * @param  {Function} next
   * @return {[object]}        [Returns user info]
   */
  function authentication(req, res, next) {
     if(logLevel === "DEBUG"){
          logger.debug("access Token "+req.headers.authorization);
    }
  var requestId = req.id;
    var username=req.params.username;
    console.log("user name is now "+username);
    var token=_.hasIn(req.headers,"authorization") && req.headers.authorization!=='undefined' && req.headers.authorization.length>0?req.headers.authorization:req.query.authorization;
        if (logLevel === "DEBUG") {
            logger.debug("requestId :: " + requestId + " :: authentication Called ");
            logger.debug("requestId :: " + requestId + " :: authentication Headers -" + JSON.stringify(req.headers));
            logger.debug("requestId :: " + requestId + " :: authentication for  -" + username);
        }

        var queryPayload = {};
            queryPayload["$and"] = [];
            queryPayload["$and"].push({ "username": username });
            queryPayload["$and"].push({ "token.token": token });
            

            co(function*() {
                var authenticateRes = yield crud.getOne('users',User,queryPayload,requestId,'authenticate');
                 if (logLevel === "DEBUG") 
                logger.debug("requestId :: " + requestId + " :: Authentication Response-"+JSON.stringify(authenticateRes));

                 var validToken=hasExpired(new Date(authenticateRes[0].token.createdOn));
                //var validToken=true;
                if(validToken===true){
                  res.send(mapError.errorCodeToDesc(requestId, '401', "authenticate"));
                }else
                  next()
            }).catch(function(err) {
                    logger.error("requestId :: " + requestId + ":: authentication Controller Exception -" + err +": JSON Error -" +JSON.stringify(err));
                  res.send(mapError.errorCodeToDesc(requestId, '401', "authenticate"));
            })
}

  module.exports = authentication;