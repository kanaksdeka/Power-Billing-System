const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const co = require('co');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let apiDetails = require(path.join(appRoot, '/api/config/settings.js'));
let newAgreementStatusService = require(path.join(appRoot, '/api/services/smt-service/new-agreement-status-service.js'));
let moment = require("moment");
let _ = require("lodash");



let secureRandom = require('secure-random');

let nJwt = require('njwt');

let crud = require(path.join(appRoot, '/api/services/dao-mongo/crud/crud_operations.js'));

let mapError = require(path.join(appRoot, '/utils/codeToErrorMapping.js'));
let encryptionDecryption = require(path.join(appRoot, '/utils/aes-encryption-decryption.js'));

let getSequence = require(path.join(appRoot, 'api/services/dao-mongo/crud/generate-sequence.js'));

const User = require(path.join(appRoot, 'api/models/User'));
const logger = getLogger('profile-loggerlogin-manager');

const sequenceCollectionName = 'sequences';


/**
 * POST /login
 * Sign in using email and password.
 */

function validate(tempUser, password) {
    let tempPassword = new encryptionDecryption();
    let passwordFromCollection = tempUser.password;
    let _pass = tempPassword.encrypt(password);
    if (passwordFromCollection == _pass)
        return true;
    else
        return false
}


exports.login = function (req, res) {
    let requestId = req.id;
    const logger = getLogger('post-login');
    let signingKey = secureRandom(256, {
        type: 'Buffer'
    }); // Create a highly random byte array of 256 bytes 
    let smt_ack = false;

    if (typeof req.body.email == 'undefined' || typeof req.body.password == 'undefined')
        //return handleError(res, "INVALID");
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "login"))



    let claims = {
        iss: "http://www.myenergybuddy.com/", // The URL of my service 
        sub: req.body.email, // The email of the user in my system 
        scope: "self"
    }

    let jwt = nJwt.create(claims, signingKey);


    if (logLevel === "DEBUG") {
        logger.debug("requestId :: " + requestId + " :: login Controller");
    }


    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();
    /*req.sanitize('email').normalizeEmail({
        remove_dots: false
    });*/

    const errors = req.validationErrors();

    if (errors === 'false') {
        logger.error("requestId :: " + requestId + " :: login Controller invalid email/password format");
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "login"))

    }
    if (logLevel === "DEBUG")
        logger.debug("requestId :: " + requestId + " :: Going to call Passport authenticate");


    /*    let  queryPayload = {
                email: req.body.email
        };*/

    co(function* () {
        try {
            nev.checkMailValidated(req.body.email, requestId, function (err, key) {
                let email = req.body.email;

                if (key === 'continue') {
                    if (logLevel === "DEBUG")
                        logger.debug("requestId :: " + requestId + ":: login Controller :: Going to Verify in user collection for -" + JSON.stringify(req.body.email));
                    User.findOne({
                        email: req.body.email
                    }, (err, user) => {
                        if (err) {
                            //handleError(res, 'INTERNAL_SERVER', err);
                            return res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "login"))

                        }
                        if (!user) {
                            //handleError(res, "NO_CONTENT");
                            return res.status(500).send(mapError.errorCodeToDesc(requestId, '204', "login"))

                        }
                        //});
                        //console.log("User Details -"+JSON.stringify(user));
                        let matching = validate(user, req.body.password);
                        if (!matching) {
                            logger.error("requestId :: " + requestId + ":: login Controller Error during authenticate");
                            // handleError(res, 'UNAUTHORIZED',"Invalid Credentials");
                            return res.status(403).send(mapError.errorCodeToDesc(requestId, '403', "login"))

                        } else {

                            async.waterfall([
                                function checkprofilestatus(done) {
                                    //check the profile status from SMT

                                    if (user.status.profilestat == false) {
                                        co(function* () {

                                            if (logLevel === "DEBUG")
                                                logger.debug("requestId :: " + requestId + ":: login Controller :: Going to fetch registraiton status for  -" + JSON.stringify(user.email));


                                            var param = {};
                                            param.trans_id = moment(new Date(), 'ddd MMM D YYYY HH:mm:ss ZZ').format('MMDDYYYYhhmmss');
                                            param.requestId = req.id;
                                            param.email = req.body.email;
                                            //param.agreementnumber = user.status.dataSharingStatus.agreementNumber;
                                            //param.statuscode = user.status.dataSharingStatus.statusCode;
                                            param.agreementnumber = typeof user.status.dataSharingStatus.agreementNumber != "undefined" && parseInt(user.status.dataSharingStatus.agreementNumber) > 0 ? user.status.dataSharingStatus.agreementNumber : 0;
                                            param.statuscode = typeof user.status.dataSharingStatus.statusCode != "undefined" && user.status.dataSharingStatus.statusCode.length > 0 ? user.status.dataSharingStatus.statusCode : "";
                                            if (logLevel === "DEBUG")
                                                logger.debug("requestId :: " + requestId + ":: newagreementStatus Controller for login ::  Query -" + JSON.stringify(param));
                                            var agreementObj = new newAgreementStatusService(param);
                                            if (logLevel === "DEBUG")
                                                logger.debug("requestId :: " + requestId + ":: newagreementStatus Controller for login :: fetching registration status from SMT ");
                                            var agreeStatus = yield agreementObj.agreestatus();
                                            if (logLevel === "DEBUG")
                                                logger.debug("requestId :: " + requestId + ":: newagreementStatus Controller for login :: SMT returned ack as  - " + JSON.stringify(agreeStatus));
                                            //res.send(agreeStatus)
                                            //smt_ack = true;
                                            done(null,user,true,agreeStatus);
                                        }).catch(function (err) {
                                            logger.error("requestId :: " + requestId + ":: newagreementStatus Controller for login Exception -" + err + ": JSON Error -" + JSON.stringify(err));
                                            // res.status(500).send(err)
                                            done(null,user, false);
                                       });
                                    }else{
                                        done(null,user, true,{});
                                        logger.error("requestId :: " + requestId + ":: login Controller going to call updatetoken");
                                    }

                                },//End of checkprofilestatus
                                function updatetoken(user, smt_ack_1,agreeStatus ,done) {
                                    logger.debug("requestId :: " + requestId + ":: login Controller Inside updatetoken");
                                    let profile_stat=user.status.profilestat;
                                    let pend_auth_stat=user.status.pendingauthStatus;
                                    let email_stat=user.status.emailConfirmStatus;

                                    //End of profile status check

                                    req.logIn(user, {
                                        session: false
                                    }, (err) => {
                                        if (err) {
                                            logger.error("requestId :: " + requestId + ":: login Controller Error logging in");
                                            //handleError(res, 'UNAUTHORIZED', err);
                                            return res.status(403).send(mapError.errorCodeToDesc(requestId, '403', "login"))

                                        } else {
                                            if (logLevel === "DEBUG") {
                                                logger.debug("requestId :: " + requestId + " :: Login success for =" + JSON.stringify(req.body.email));
                                            }
                                            //Create a token and add to user and save
                                            /*                    let  token = jwt.encode({
                                                                    email: user.email,
                                                                    time: new Date().getTime()
                                                                    
                                                                }, tokenSecret);
                                                                user.token = jwt*/
                                            ;
                                            let queryPayload = {
                                                "email": user.email
                                            };
                                            let finalUpdateQuery = {};
                                            if (smt_ack_1 == false) {
                                                finalUpdateQuery = {
                                                    $set: {
                                                        "token": {
                                                            "createdOn": new Date(),
                                                            "token": jwt
                                                        }
                                                    }
                                                };
                                            } else {
                                                if(agreeStatus && Object.keys(agreeStatus).length> 0){
                                                    logger.debug("requestId :: " + requestId + " :: Login will update the data sharing agreement" );

                                                    if(agreeStatus.body.agreementStatusList[0].status=="Pending - Customer Authorization"){
                                                        finalUpdateQuery = {
                                                            $set: {
                                                                "token": {
                                                                    "createdOn": new Date(),
                                                                    "token": jwt
                                                                },
                                                                "status.pendingauthStatus":true,
                                                                "status.emailConfirmStatus":false,
                                                            }
                                                        };
                                                        pend_auth_stat=true; 
                                                        email_stat=false; // user have not ACk the mail
                                                    }


                                                    else if(agreeStatus.body.agreementStatusList[0].status=="Active - Authorization Confirmed"){
                                                        finalUpdateQuery = {
                                                            $set: {
                                                                "token": {
                                                                    "createdOn": new Date(),
                                                                    "token": jwt
                                                                },
                                                                "status.profilestat": true,
                                                                "status.emailConfirmStatus":true,
                                                                "status.dataSharingStatus": agreeStatus.body,
                                                                "status.pendingauthStatus":false
                                                            }
                                                        };
                                                        profile_stat=true;
                                                        pend_auth_stat=false;
                                                        email_stat=true;
                                                    }else{
                                                        finalUpdateQuery = {
                                                            $set: {
                                                                "token": {
                                                                    "createdOn": new Date(),
                                                                    "token": jwt
                                                                },
                                                                //"status.dataSharingStatus": agreeStatus.body
                                                            }
                                                        };
                                                    }
                                                }else{
                                                    logger.debug("requestId :: " + requestId + " :: Login no data sharing agreement required" );
                                                    finalUpdateQuery = {
                                                        $set: {
                                                            "token": {
                                                                "createdOn": new Date(),
                                                                "token": jwt
                                                            },
                                                        }
                                                    };

                                                }

                                            }
                                            co(function* () {
                                                let updateRes = yield crud.updateData('user', User, queryPayload, finalUpdateQuery, requestId, 'login');
                                            }).catch(function (err) {
                                                logger.error("requestId :: " + requestId + ":: login Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
                                                //handleError(res, 'EXCEPTION', err);
                                                return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "login"))


                                            });
                                            let token = jwt.compact();
                                            res.send(200, {
                                                'token': token,
                                                'email':user.email,
                                                'profile': user.profile,
                                                'status': {
                                                    'esiid': user.status.esiidfetched,
                                                    'meter': user.status.meterfetched,
                                                    'profilestat': profile_stat,
                                                    'emailConfirmStatus':email_stat,
                                                    'pendingauthStatus':pend_auth_stat

                                                },
                                                // 'category': user.category.categoryType,
                                                // 'id': user.userId
                                            });
                                        }
                                    });
                                }//End of function updatetoken
                            ], (err) => {
                                if (err) {
                                    logger.error("requestId :: " + requestId + " :: login Controller Async Waterfall Error for  -" + req.body.email + " Error is -"+err);
                                    return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "login"))
                                }
                            }); // End of Async waterfall

                        } //End of Else for matching
                    }); // End of User found
                } // End of key==true
                else if (key === 'forbidden') {
                    logger.error("requestId :: " + requestId + ":: login Controller :: Forbidden as email not verified is -" + email);
                    //  handleError(res, "FORBIDDEN");
                    return res.status(403).send(mapError.errorCodeToDesc(requestId, '403', "login"))

                }
                else {
                    logger.error("requestId :: " + requestId + ":: login got an Error from email_verification  -" + err);
                    //handleError(res, 'INTERNAL_SERVER', err);
                    return res.status(501).send(mapError.errorCodeToDesc(requestId, '501', "login"))

                }

            });//checkMailValidated end
        } catch (err) { //catch for try block
            logger.error("requestId :: " + requestId + ":: login catch block  -" + err);
            //handleError(res, 'EXCEPTION', err);
            return res.status(500).send(mapError.errorCodeToDesc(requestId, '500', "login"))

        }
    }).catch(function (err) {  //catch for co
        logger.error("requestId :: " + requestId + ":: login Controller  -" + err);
        //handleError(res, 'EXCEPTION', err);
        return res.status(502).send(mapError.errorCodeToDesc(requestId, '502', "login"))

    });
};



/**
 * POST /logout
 * Log out.
 */
exports.logout = function (req, res) {
    let requestId = req.id;
    let email = req.body.email;
    let token = req.headers.authorization;
    const logger = getLogger('logout');


    req.assert('email', 'Email is not valid').isEmail();
    /*req.sanitize('email').normalizeEmail({
        remove_dots: false
    });*/

    const errors = req.validationErrors();

    if (errors === 'false') {
        logger.error("requestId :: " + requestId + " :: logout Controller invalid email format");
        return res.status(401).send(mapError.errorCodeToDesc(requestId, '502', "logout"))

    }

    try {
        if (logLevel === "DEBUG") {
            logger.debug("requestId :: " + requestId + " :: Logout Called ");
            logger.debug("requestId :: " + requestId + " :: Logout Headers -" + JSON.stringify(req.headers));
            logger.debug("requestId :: " + requestId + " :: Logout For -" + JSON.stringify(email));
        }

        let queryPayload = {};
        queryPayload["$and"] = [];
        queryPayload["$and"].push({
            "email": email
        });
        queryPayload["$and"].push({
            "token.token": token
        });


        let finalUpdateQuery = {
            $set: {
                "token": null
            }
        };
        co(function* () {
            let updateRes = yield crud.updateData('user', User, queryPayload, finalUpdateQuery, requestId, 'logout');
            return res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "logout"))

        }).catch(function (err) {
            logger.error("requestId :: " + requestId + ":: logout Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
            return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "logout"))

        });
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: Logout Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "logout"))
    }
};

/**
 * POST /account/forgot/password
 * Process the reset password request.
 */

function generateRandomPassword() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.forgotpassword = (req, res, next) => {

    const logger = getLogger('forgotpassword');
    let resetTokenInMail = "";
    req.assert('email', 'Email is not valid').isEmail();
    /*req.sanitize('email').normalizeEmail({
        remove_dots: false
    });*/

    try {
        const errors = req.validationErrors();
        let requestId = req.id;

        if (errors === 'false') {
            logger.error("requestId :: " + requestId + " :: forgotpassword Controller Validation Error");
            return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "forgotpassword"))
        }
        let password = generateRandomPassword();
        async.waterfall([
            function resetPassword(done) {
                User.findOne({
                    email: req.body.email
                }, (err, user) => {
                    if (err) {
                        logger.error("requestId :: " + requestId + " :: forgotpassword Controller Error in executing Find Query");
                        return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "forgotpassword"));
                    }
                    if (!user) {
                        logger.error("requestId :: " + requestId + " :: forgotpassword Controller Error User not found");
                        return res.status(204).send(mapError.errorCodeToDesc(requestId, '204', "forgotpassword"))
                    }

                    //Encrypt The Password before resetting

                    let tempPassword = new encryptionDecryption();
                    let _pass = tempPassword.encrypt(password);
                    resetTokenInMail = _pass;

                    user.passwordResetToken = _pass;
                    user.passwordResetExpires = Date.now() + 3600; // 1 hour
                    user.save((err) => {
                        if (err) {
                            logger.error("requestId :: " + requestId + " :: forgotpassword Controller Error in saving password information-" + err);
                            return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "forgotpassword"))

                        }
                        logger.debug("requestId :: " + requestId + " :: forgotpassword Controller Password saved");
                        done(err, password, user);
                    });
                });
                logger.debug("requestId :: " + requestId + " :: forgotpassword Going to send reset password mail");

            },
            function sendForgotPasswordEmail(password, user, done) {
                logger.debug("requestId :: " + requestId + " :: forgotpassword Inside send reset mail due to forget password");
                const transporter = nodemailer.createTransport({
                    host: apiDetails.email.host,
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: apiDetails.email.user,
                        pass: apiDetails.email.password
                    }
                });

                const mailOptions = {
                    to: user.email,
                    from: apiDetails.email.sendermail,
                    subject: 'Your MyEnergyBuddy password reset',
                    text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
                    Please click on the following link(valid for 60 minutes), or paste this into your browser to complete the process:\n\n
                    https://www.myenergybuddy.com/account/reset?resettoken=${resetTokenInMail}\n\n
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`

                };
                transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                        logger.error("requestId :: " + requestId + " :: forgotpassword Error sending Password reset confirmation mail for -" + req.body.email);
                        return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "forgotpassword"))
                    } else {
                        logger.debug("requestId :: " + requestId + " :: forgotpassword an e-mail has been sent to " + req.body.email + ' with new password');
                        return res.status(500).send(mapError.errorCodeToDesc(requestId, '200', "forgotpassword"));
                    }
                });
            }
        ], (err) => {
            if (err) {
                logger.error("requestId :: " + requestId + " :: forgotpassword Async Waterfall Error for  -" + req.body.email);
                return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "forgotpassword"))
            }
        });
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: Forgot Password Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "forgotpassword"))

    }
};

/**
 * POST /account/change/password
 * Process the change password request.
 */

exports.changepassword = (req, res, next) => {

    const logger = getLogger('changepassword');
    let email = "";
    let requestId = req.id;

    try {

        let password = req.body.newpassword;
        let resettoken = typeof req.body.resettoken != 'undefined' && req.body.resettoken.length > 0 ? req.body.resettoken : 0;

        async.waterfall([
            function validation(done) {
                let errors = true

                if (resettoken == 0) {
                    logger.debug("requestId :: " + requestId + " :: Password change via profile");

                    if (typeof req.body.currentpassword == 'undefined' || typeof req.body.newpassword == 'undefined' || typeof req.body.confirmpassword == 'undefined')
                        errors = false;
                    if (errors == true && req.body.newpassword == req.body.currentpassword)
                        errors = false;
                    if (errors == true && req.body.newpassword != req.body.confirmpassword)
                        errors = false;
                    if (errors == true && req.body.newpassword.length < 6)
                        errors = false;
                } else {
                    logger.debug("requestId :: " + requestId + " :: Password change due to forget passsword initiation");

                    if (typeof req.body.confirmpassword == 'undefined' || typeof req.body.newpassword == 'undefined')
                        errors = false;
                    if (errors == true && req.body.newpassword != req.body.confirmpassword) {
                        errors = false;
                    }
                    if (errors == true && req.body.newpassword.length < 6)
                        errors = false;

                }

                logger.debug("requestId :: " + requestId + " :: Value of errors is -" + errors);


                if (errors === false) {
                    logger.debug("requestId :: " + requestId + " :: changepassword Controller Validation Error");
                    return res.status(401).send(mapError.errorCodeToDesc(requestId, '400', "changepassword"))
                }
                done(null, errors);

            },
            function resetPassword(errors, done) {
                let query = {}
                if (resettoken == 0) {
                    const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;

                    query = {
                        email: req.body.email

                    }
                } else {
                    query = {
                        passwordResetToken: resettoken
                    }
                }
                User.findOne(query
                    , (err, user) => {
                        if (err) {
                            logger.error("requestId :: " + requestId + " :: changepassword Controller Error in executing Find Query");
                            return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "changepassword"))
                        }
                        if (!user) {
                            logger.error("requestId :: " + requestId + " :: changepassword Controller Error User not found");
                            return res.status(401).send(mapError.errorCodeToDesc(requestId, '204', "changepassword"))
                        }
                        email = user.email;
                        let tempPassword = new encryptionDecryption();
                        let _pass = "";
                        if (resettoken == 0) {
                            _pass = tempPassword.encrypt(req.body.newpassword);
                            user.password = _pass;
                        } else {
                            if (user.passwordResetExpires > Date.now()) {
                                logger.error("requestId :: " + requestId + " :: changepassword Controller token expied");
                                return res.status(500).send(mapError.errorCodeToDesc(requestId, '504', "changepassword"))
                            } else {
                                _pass = tempPassword.encrypt(req.body.newpassword);
                                user.password = _pass;
                                user.passwordResetExpires = null;
                                user.passwordResetToken = null;

                            }
                        }

                        user.save((err) => {
                            if (err) {
                                logger.error("requestId :: " + requestId + " :: changepassword Controller Error in saving password information-" + err);
                                return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "changepassword"))
                            }
                            logger.debug("requestId :: " + requestId + " :: changepassword Controller Password saved");
                            done(err, password, user);
                        });
                    });
                logger.debug("requestId :: " + requestId + " :: changepassword Going to send change password mail");

            },
            function sendchangepasswordEmail(password, user, done) {
                logger.debug("requestId :: " + requestId + " :: changepassword Inside send change password mail");
                const transporter = nodemailer.createTransport({
                    host: apiDetails.email.host,
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: apiDetails.email.user,
                        pass: apiDetails.email.password
                    }
                });

                const mailOptions = {
                    to: user.email,
                    from: apiDetails.email.sendermail,
                    subject: 'Your MyEnergyBuddy password has been changed',
                    text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has been changed.`
                };
                transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                        logger.error("requestId :: " + requestId + " :: changepassword Error sending Password reset confirmation mail for -" + email);
                        return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "changepassword"))
                    } else {
                        logger.debug("requestId :: " + requestId + " :: changepassword an e-mail has been sent to " + email + ' password change confirmation');
                        return res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "changepassword"));
                    }

                });
            }
        ], (err) => {
            if (err) {
                logger.error("requestId :: " + requestId + " :: changepassword Async Waterfall Error for  -" + email);
                return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "changepassword"))
            }
        });
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: Change Password Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "changepassword"))

    }
};







exports.changeprofilepassword = (req, res, next) => {

    const logger = getLogger('changeprofilepassword');
    let email = "";
    let requestId = req.id;
    const authtoken = _.hasIn(req.headers, "authorization") && req.headers.authorization != 'undefined' && req.headers.authorization.length > 0 ? req.headers.authorization : 0;
    try {

        let password = req.body.newpassword;

        async.waterfall([
            function validation(done) {
                let errors = true

                    logger.debug("requestId :: " + requestId + " :: Password change via profile");

                    if (typeof req.body.currentpassword == 'undefined' || typeof req.body.newpassword == 'undefined' || typeof req.body.confirmpassword == 'undefined')
                        errors = false;
                    if (errors == true && req.body.newpassword == req.body.currentpassword)
                        errors = false;
                    if (errors == true && req.body.newpassword != req.body.confirmpassword)
                        errors = false;
                    if (errors == true && req.body.newpassword.length < 6)
                        errors = false;

                logger.debug("requestId :: " + requestId + " :: Value of errors is -" + errors);


                if (errors === false) {
                    logger.debug("requestId :: " + requestId + " :: changeprofilepassword Controller Validation Error");
                    return res.status(401).send(mapError.errorCodeToDesc(requestId, '400', "changepassword"))
                }
                done(null, errors);

            },
            function resetPassword(errors, done) {
                let query = {}
                    query = {
                        "token.token": authtoken
                    }
                User.findOne(query
                    , (err, user) => {
                        if (err) {
                            logger.error("requestId :: " + requestId + " :: changeprofilepassword Controller Error in executing Find Query");
                            return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "changepassword"))
                        }
                        if (!user) {
                            logger.error("requestId :: " + requestId + " :: changeprofilepassword Controller Error User not found");
                            return res.status(401).send(mapError.errorCodeToDesc(requestId, '204', "changepassword"))
                        }
                        email = user.email;
                        let tempPassword = new encryptionDecryption();
                        let _pass = "";
                            _pass = tempPassword.encrypt(req.body.newpassword);
                            user.password = _pass;

                        user.save((err) => {
                            if (err) {
                                logger.error("requestId :: " + requestId + " :: changeprofilepassword Controller Error in saving password information-" + err);
                                return res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "changepassword"))
                            }
                            logger.debug("requestId :: " + requestId + " :: changeprofilepassword Controller Password saved");
                            done(err, password, user);
                        });
                    });
                logger.debug("requestId :: " + requestId + " :: changeprofilepassword Going to send change password mail");

            },
            function sendchangepasswordEmail(password, user, done) {
                logger.debug("requestId :: " + requestId + " :: changeprofilepassword Inside send change password mail");
                const transporter = nodemailer.createTransport({
                    host: apiDetails.email.host,
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: apiDetails.email.user,
                        pass: apiDetails.email.password
                    }
                });

                const mailOptions = {
                    to: user.email,
                    from: apiDetails.email.sendermail,
                    subject: 'Your MyEnergyBuddy password has been changed',
                    text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has been changed.`
                };
                transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                        logger.error("requestId :: " + requestId + " :: changeprofilepassword Error sending Password reset confirmation mail for -" + email);
                        return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "changepassword"))
                    } else {
                        logger.debug("requestId :: " + requestId + " :: changeprofilepassword an e-mail has been sent to " + email + ' password change confirmation');
                        return res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "changepassword"));
                    }

                });
            }
        ], (err) => {
            if (err) {
                logger.error("requestId :: " + requestId + " :: Async Waterfall Error for  -" + email);
                return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "changepassword"))
            }
        });
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: Change Password Exception -" + err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "changepassword"))

    }
};