
'use strict';

var express = require('express');
var co = require('co');
var path = require('path');
var appRoot = path.join(require('app-root-dir').get(), '/server/');
var app = require(path.join(appRoot, 'app.js'));
var logger = getLogger('utils');
var jsonCheck = require("lodash");



function convertStringToDate(payload, pathArr, requestId) {
    var _tempPayload = payload
    return new Promise(function (resolve, reject) {
        try {
            for (var index = 0; index < pathArr.length; index++) {
                if (pathArr[index].action === 'C') {
                    if (jsonCheck.get(_tempPayload, pathArr[index].path))
                        jsonCheck.set(_tempPayload, pathArr[index].path, new Date());
                } else if (pathArr[index].action === 'U') {
                    if (jsonCheck.get(_tempPayload, pathArr[index].path))
                        jsonCheck.set(_tempPayload, pathArr[index].path, setDateandTime(jsonCheck.get(_tempPayload, pathArr[index].path)));
                } else {
                    if (jsonCheck.get(_tempPayload, pathArr[index].path)) {
                        jsonCheck.set(_tempPayload, pathArr[index].path, setDateWithoutTime(jsonCheck.get(_tempPayload, pathArr[index].path)));
                    }
                }

            }
            if (logLevel === "DEBUG")
                logger.error("requestId :: " + requestId + ":: Converted Payload with Date -" + JSON.stringify(_tempPayload));
            resolve(_tempPayload)
        } catch (err) {
            logger.error("requestId :: " + requestId + ":: convertStringToDate Exception -" + err);
            reject(err);
        }
    });
}




var mongoQueryJSON = function (obj, path, resJSON) {
    for (var key in obj) {
        if (typeof obj[key] === 'object' && Object.prototype.toString.call(obj[key]) !== '[object Date]' && Object.prototype.toString.call(obj[key]) !== '[object Array]') {
            var newPath;
            if (path !== "") {
                newPath = path + "." + key;
            } else {
                newPath = key;
            }
            mongoQueryJSON(obj[key], newPath, resJSON);

        } else {
            //else got the values
            var unsetJSON;
            var unsetKeyVal;
            if (typeof obj[key] === 'number' && obj[key] === -1) {
                unsetJSON = resJSON.$unset;
                unsetKeyVal;
                if (path !== "") {
                    unsetKeyVal = path + "." + key;
                } else {
                    unsetKeyVal = key;
                }
                unsetJSON[unsetKeyVal] = "";
            } else {

                var val = obj[key];
                if (val === "") {
                    unsetJSON = resJSON.$unset;
                    unsetKeyVal;
                    if (path !== "") {
                        unsetKeyVal = path + "." + key;
                    } else {
                        unsetKeyVal = key;
                    }
                    unsetJSON[unsetKeyVal] = "";

                } else {
                    if (Object.prototype.toString.call(val) === '[object Array]' && val.length === 0) {
                        continue;
                    }
                    var setKeyVal;
                    var setJSON = resJSON.$set;
                    if (path !== "") {
                        setKeyVal = path + "." + key;
                    } else {
                        setKeyVal = key;
                    }
                    setJSON[setKeyVal] = val;

                }
            }
        }
    }
}

var flattenArray = function (obj, path, pathArr, arrayResJSON, isDelete) {
    var arrayObj = jsonCheck.get(obj, path, null);
    if (arrayObj != null && jsonCheck._.isEmpty(arrayObj) === false) {
        for (var eachDocument of arrayObj) {
            var key = "";
            var arrLen = pathArr.length;
            var keyPresent = true;
            for (var i = 0; i < arrLen; i++) {
                var pathArrayValue = jsonCheck.get(eachDocument, pathArr[i], null);
                if (pathArrayValue != null) {
                    if (key !== "") {
                        key = key + "_" + pathArrayValue;
                    } else {
                        key = pathArrayValue;
                    }
                } else {
                    keyPresent = false;
                }
            }
            if (keyPresent === true) {
                if (isDelete === false) {
                    arrayResJSON[key] = eachDocument;
                } else {
                    arrayResJSON[key] = "";
                }
            }
        }
    }
}

var flattenArrayForCRUD = function (obj, parentPath, childPath, pathArr) {
    var parentJsonObj = jsonCheck.get(obj, parentPath, null);
    if (parentJsonObj != null) {
        var childJsonObj = jsonCheck.get(parentJsonObj, childPath, null);
        if (childJsonObj != null) {
            var newChildJson = {};
            flattenArray(childJsonObj, "add", pathArr, newChildJson, false);
            flattenArray(childJsonObj, "update", pathArr, newChildJson, false);
            flattenArray(childJsonObj, "delete", pathArr, newChildJson, true);
            if (jsonCheck._.isEmpty(newChildJson) === false) {
                if (logLevel === "DEBUG") {
                    logger.debug("newChildJson is:" + JSON.stringify(newChildJson));
                }
                parentJsonObj[childPath] = newChildJson;
            }

        }

    }
}

var flattenArrayForUpdate = function (obj, parentPath, childPath, pathArr) {
    var parentJsonObj = jsonCheck.get(obj, parentPath, null);
    if (parentJsonObj != null) {
        var newChildJson = {};
        flattenArray(parentJsonObj, childPath, pathArr, newChildJson, false);
        if (jsonCheck._.isEmpty(newChildJson) === false) {
            if (logLevel === "DEBUG") {
                logger.debug("newChildJson is:" + JSON.stringify(newChildJson));
            }
            parentJsonObj[childPath] = newChildJson;
        }

    }
}

var flattenArrayForQuery = function (obj, parentPath, childPath) {
    var parentJSONObj = jsonCheck.get(obj, parentPath, null);
    if (parentJSONObj != null) {
        var childJSONObj = jsonCheck.get(parentJSONObj, childPath, null);
        if (childJSONObj != null) {
            var jsonArray = [];
            var count = 0;
            for (var eachKey in childJSONObj) {
                if (childJSONObj.hasOwnProperty(eachKey)) {
                    jsonArray.push(childJSONObj[eachKey]);
                    count = count + 1;
                }
            }
            if (count > 0) {
                parentJSONObj[childPath] = jsonArray;
            }
        }
    }
}


var setDateandTime = function (inputDate) {
    var _inputDate = new Date(inputDate);
    var userTimezoneOffset = new Date().getTimezoneOffset() * 60000;
    var _convertedDate = new Date(_inputDate.getTime() + userTimezoneOffset);
    return _convertedDate;
}
var setDateWithoutTime = function (inputDate) {
    var _inputDate = new moment(inputDate);
    var dateStr = _inputDate.get("year") + "-" + getWithTwoDigit((_inputDate.get("month") + 1)) + "-" + getWithTwoDigit((_inputDate.get("date")));
    var retDate = new Date(dateStr + "T00:00:00.000Z");


    return retDate;
}

function getWithTwoDigit(curDate) {
    var retDate;
    var curDateMonthInt = parseInt(curDate, 10);
    if (curDateMonthInt < 10) {
        retDate = "0" + curDate;
    } else {
        retDate = curDate;
    }
    return retDate;
}

module.exports = {
    mongoQueryJSON: mongoQueryJSON,
    flattenArray: flattenArray,
    flattenArrayForCRUD: flattenArrayForCRUD,
    flattenArrayForUpdate: flattenArrayForUpdate,
    flattenArrayForQuery: flattenArrayForQuery,
    setDateandTime: setDateandTime,
    convertStringToDate: convertStringToDate
}
