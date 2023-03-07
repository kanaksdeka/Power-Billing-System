'use strict';

var request = require('request');
var path = require('path');
var co = require('co');
var express = require('express');
var appRoot = path.join(require('app-root-dir').get(),'/server/');
var apiDetails =require(path.join(appRoot,'/api/config/settings.js'));
var logger = getLogger('language');
function languageCheck(req, res, next) {
    if (req.query.lang) {
        var lang = req.query.lang;
        console.log("Language -"+lang)
        co(function*() {
            return yield next();
        }).catch(function(err) {
			logger.error("Error :" + JSON.stringify((err)) );
            errorHandler(res,"NOT_FOUND");
        });
    } else {
        return next();
    }
}


module.exports = languageCheck;