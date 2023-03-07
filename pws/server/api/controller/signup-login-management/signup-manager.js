let bodyParser = require('body-parser');
let bcrypt = require('bcrypt-nodejs');
let co = require('co');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let apiDetails = require(path.join(appRoot, '/api/config/settings.js'));


let getSequence = require(path.join(appRoot, 'api/services/dao-mongo/crud/generate-sequence.js'));
let request = require('request');
let mapError = require(path.join(appRoot, '/utils/codeToErrorMapping.js'));


const mongoose = require('mongoose');
nev = require(path.join(appRoot, 'api/controller/signup-login-management/email-manager'))(mongoose);



// our persistent user model
const User = require(path.join(appRoot, 'api/models/User'));

/*
// sync version of hashing function
var myHasher = function(password, tempUserData, insertTempUser, callback) {
  var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
  return insertTempUser(hash, tempUserData, callback);
};*/

// async version of hashing function
/*var myHasher = function(password, tempUserData, insertTempUser, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
     console.log("Temp user password is -"+hash);

      return insertTempUser(hash, tempUserData, callback);
    });
  });
};*/


var myHasher = function (password, tempUserData, insertTempUser, callback) {
    var hashedPassword;
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        console.log('Password string passed for hashing -' + password);
        bcrypt.hash(password, salt, null, (err, hash) => {
            if (err) {
                return err;
            }
            //user.password = hash;
            //next();
            hashedPassword = hash
            return insertTempUser(hash, tempUserData, callback);

        });
    });
}

nev.configure({
    persistentUserModel: User,
    expirationTime: 1800, // 30 minutes

    //verificationURL: 'https://www.myenergybuddy.com/account/email-verification/${URL}',
    //verificationURL:'https://35.164.171.15/activate?${URL}',
    verificationURL:'https://www.myenergybuddy.com/activate?${URL}',

   transportOptions: {
        host: apiDetails.email.host,
        port: 465,
        secure: true, // use SSL
        auth: {
          user: apiDetails.email.user,
          pass: apiDetails.email.password
        }
      },
    hashingFunction: myHasher,
    passwordFieldName: 'password',
}, function (err, options) {
    if (err) {
        logger.error("Error in configuring -" + err);
        return;
    }

    console.log('configured: ' + (typeof options === 'object'));
});

nev.generateTempUserModel(User, function (err, tempUserModel) {
    const logger = getLogger('generateTempUserModel');

    if (err) {
        logger.error("Error in generating temp user model -" + err);
        return;
    }

    logger.error('generated temp user model: ' + (typeof tempUserModel === 'function'));
});


exports.tempSignUp = function (req, res) {
    var requestId = req.id;
    var email = req.body.email;
    var error = {};
    var findExists = {};

    const logger = getLogger('tempSignUp');


    // Go ahead and validate Captcha 
    var errorDetails = {};
    var _continue = true;

    //End of Captach Validations
    if (_continue === false) {
        logger.debug("requestId :: " + requestId + ":: tempSignUp _continue Error is :" + JSON.stringify(errorDetails));
        res.status(401).send(mapError.errorCodeToDesc(requestId, '401', "tempSignUp"))
    } else {
        var errors = [];
        co(function* () {
            req.assert('email', 'Email is not valid').isEmail();
            req.assert('password', 'Password must be 6-10 characters long').len(6, 10);
            req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
            req.assert('firstName', 'First Name is Mandatory').notEmpty();
            req.assert('lastName', 'Last Name is Mandatory').notEmpty();


            /*req.sanitize('email').normalizeEmail({
                remove_dots: false
            });*/
            errors = req.validationErrors();
            logger.debug("requestId :: " + requestId + ":: Validation Error -" + JSON.stringify(errors));
        }).catch(function (err) {
            logger.error("requestId :: " + requestId + ":: tempSignUp Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
            res.status(401).send(mapError.errorCodeToDesc(requestId, '402', "tempSignUp"))

        });

        if (errors.length > 0) {
            for(i=0;i<errors.length;i++){
                switch(errors[i].param){
                    case "email":{
                                logger.error("requestId :: " + requestId + " :: tempSignUp Controller email format not valid");
                                res.status(401).send(mapError.errorCodeToDesc(requestId, '407', "tempSignUp"))
                                break;
                    }
                    case "password":{
                                    logger.error("requestId :: " + requestId + " :: tempSignUp Controller Password must be 6-10 characters long");
                                    res.status(401).send(mapError.errorCodeToDesc(requestId, '408', "tempSignUp"))
                                    break;
                                }
                    case "confirmPassword":{
                                    logger.error("requestId :: " + requestId + " :: tempSignUp Controller Passwords do not match");
                                    res.status(401).send(mapError.errorCodeToDesc(requestId, '409', "tempSignUp"))
                                    break;
                                }
                    case "firstName":{
                                    logger.error("requestId :: " + requestId + " :: tempSignUp Controller First Name is Mandatory");
                                    res.status(401).send(mapError.errorCodeToDesc(requestId, '410', "tempSignUp"))
                                    break;
                                }       
                    case "lastName":{
                        logger.error("requestId :: " + requestId + " :: tempSignUp Controller Last Name is Mandatory");
                        res.status(401).send(mapError.errorCodeToDesc(requestId, '411', "tempSignUp"))
                        break;
                    }       

                }
            }

           } else {

            const registerPaylod = new User({
                email: req.body.email,
                password: req.body.password,
                profile: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    fullname: "",
                    phoneNumber:0,
                    esiid:"",
                    meterid:"",
                    contractendingon:null,
                    currentprovider:"",
                    address: {
                        zipCode: typeof req.body.zipcode != "undefined" && req.body.zipcode > 0 ? req.body.zipcode : 0,
                        address: "",
                        residenceType: "",
                        duration:0,
                        state: "",
                        apartmentNumber:""
                    }
                },
                category: {
                    categoryType: typeof req.body.category != "undefined" && req.body.category.length > 0 ? req.body.category : "U"

                },
                status:{
                    esiidfetched: false,
                    meterfetched: false,
                    profilestat: false
                  },
            });
            if (logLevel === "DEBUG") {
                logger.debug("requestId :: " + requestId + ":: tempSignUp Register Payload  is:" + JSON.stringify(registerPaylod));
            }



            co(function* () {
                var sequenceNumber = yield getSequence.sequenceNumber(requestId, 'sequences');
                if (logLevel === "DEBUG") {
                    logger.debug("requestId :: " + requestId + ":: tempSignUp sequence number received is:" + JSON.stringify(sequenceNumber));
                }
                registerPaylod.userId = sequenceNumber.sequence_value;
            }).catch(function (err) {
                logger.error("requestId :: " + requestId + ":: tempSignUp Controller Exception -" + err + ": JSON Error -" + JSON.stringify(err));
                res.status(500).send(mapError.errorCodeToDesc(requestId, '501', "tempSignUp"))
            });

            if (logLevel === "DEBUG") {
                logger.debug("requestId :: " + requestId + " :: tempSignUp Called ");
                logger.debug("requestId :: " + requestId + " :: The Payload to Register is -" + JSON.stringify(registerPaylod));
            }

            try {
                nev.createTempUser(registerPaylod, requestId, function (err, existingPersistentUser, newTempUser) {
                    if (err) {
                        return res.status(404).send(mapError.errorCodeToDesc(requestId, '404', "tempSignUp"))

                    }

                    // user already exists in persistent collection
                    if (existingPersistentUser) {
                        logger.error("requestId :: " + requestId + " :: tempSignUp An account with the provided mail id  -" + JSON.stringify(req.body.email) + "  already exists");
                        return res.status(401).send(mapError.errorCodeToDesc(requestId, '405', "tempSignUp"))

                    }

                    // new user created
                    if (newTempUser) {
                        var URL = newTempUser[nev.options.URLFieldName];

                        nev.sendVerificationEmail(email, URL, function (err, info) {
                            if (err) {
                                logger.error("requestId :: " + requestId + " :: tempSignUp ERROR: sending verification email FAILED -" + err);
                                return res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "tempSignUp"))

                            }
                            //Moving the Success message to Error Mapping
                            return res.status(200).send(mapError.errorCodeToDesc(requestId, '200', "tempSignUp"));
                        });
                    }
                    // user already exists in temporary collection!
                    else {
                        logger.error("requestId :: " + requestId + " :: tempSignUp You have already signed up. Please check your email to verify your account.");
                        return res.status(401).send(mapError.errorCodeToDesc(requestId, '406', "tempSignUp"))

                    }
                })
            } catch (err) {
                logger.error("requestId :: " + requestId + " :: tempSignUp Send mail Exception -" + err);
                res.status(500).send(mapError.errorCodeToDesc(requestId, '503', "tempSignUp"))

            }
        }
    }
};

// user accesses the link that is sent
exports.verifyAccount = function (req, res) {
    const logger = getLogger('verifyAccount');

    var requestId = req.id;
    var url = req.params.url;
    try {
        nev.confirmTempUser(url, function (err, user) {
            if (user) {
                nev.sendConfirmationEmail(user.email, function (err, info) {
                    if (err) {
                        logger.error("requestId :: " + requestId + " :: verifyAccount ERROR: sending confirmation email FAILED for -" + JSON.stringify(user.email));
                        return res.status(200).send('User Verified,but failed to send Confirmation mail');
                    }
                    if (logLevel === "DEBUG") {
                        logger.debug("requestId :: " + requestId + " :: verifyAccount  User CONFIRMED -" + JSON.stringify(user.email));
                    }
                    return res.status(200).send(mapError.errorCodeToDesc(requestId, '201', "tempSignUp"));
                });
            } else {
                logger.error("requestId :: " + requestId + " :: verifyAccount ERROR: confirming user FAILED for -" + JSON.stringify(user));
                return res.status(404).send(mapError.errorCodeToDesc(requestId, '504', "tempSignUp"));
            }
        });
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: verifyAccount Send mail Exception -" + err);
        //handleError(res, 'INTERNAL_SERVER', err);
        return res.status(500).send(mapError.errorCodeToDesc(requestId, '505', "tempSignUp"));
    }


};