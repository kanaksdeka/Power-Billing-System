var logger = getLogger('ErrorMapping');
var errormapping = require('./errormapping.js')

exports.errorCodeToDesc=function(requestId, code,module) {
    
       /* console.log("Request id -"+requestId);
        console.log("module -"+module);
        console.log("code -"+code);*/



        var errorCode = errormapping[module][code].resCode;
        var errorDesc = errormapping[module][code].resDesc;
        var mappedError={
            "errorCode_":errorCode,
            "errorDesc_":errorDesc
        }

        if (logLevel === "DEBUG") {
            logger.debug("requestId :: " + requestId + ":: errorCodeToDesc :: Mapped Error is -" + JSON.stringify(mappedError));
        }

        return(mappedError);
}


//module.exports = errorCodeToDesc;
