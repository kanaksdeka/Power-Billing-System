'use strict';

let randtoken = require('rand-token');
let nodemailer = require('nodemailer');
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let apiDetails = require(path.join(appRoot, '/api/config/settings.js'));
let encryptionDecryption = require(path.join(appRoot, '/utils/aes-encryption-decryption.js'));
const User = require(path.join(appRoot, 'api/models/User'));


module.exports = function (mongoose) {

  let isPositiveInteger = function (x) {
    return ((parseInt(x, 10) === x) && (x >= 0));
  };

  let createOptionError = function (optionName, optionValue, expectedType) {
    return new TypeError('Expected ' + optionName + ' to be a ' + expectedType + ', got ' +
      typeof optionValue);
  };

  /**
   * Retrieve a nested value of an object given a string, using dot notation.
   *
   * @func getNestedValue
   * @param {object} obj - object to retrieve the value from
   * @param {string} path - path to value
   * @param {string} def - default value to return if not found
   */
  let getNestedValue = function (obj, path, def) {
    path = path.split('.');
    for (let i = 0, len = path.length; i < len; i++) {
      if (!obj || typeof obj !== 'object') {
        return def;
      }
      obj = obj[path[i]];
    }

    if (obj === undefined) {
      return def;
    }
    return obj;
  };

  /**
   * Create a Mongoose Model for the temporary user, based off of the persistent
   * User model, i.e. the temporary user inherits the persistent user. An
   * additional field for the URL is created, as well as a TTL.
   *
   * @func generateTempUserModel
   * @param {object} User - the persistent User model.
   * @return {object} the temporary user model
   */
  let generateTempUserModel = function (User, callback) {
    const logger = getLogger('generateTempUserModel');

    if (!User) {
      return callback(new TypeError('Persistent user model undefined.'), null);
    }
    let tempUserSchemaObject = {}, // a copy of the schema
      tempUserSchema;

    // copy over the attributes of the schema
    Object.keys(User.schema.paths).forEach(function (field) {
      tempUserSchemaObject[field] = User.schema.paths[field].options;
    });
    tempUserSchemaObject[options.URLFieldName] = String;

    // create a TTL
    tempUserSchemaObject.createdAt = {
      type: Date,
      expires: options.expirationTime.toString() + 's',
      default: Date.now
    };


    tempUserSchema = mongoose.Schema(tempUserSchemaObject);

    // copy over the methods of the schema
    Object.keys(User.schema.methods).forEach(function (meth) { // tread lightly
      tempUserSchema.methods[meth] = User.schema.methods[meth];
    });

    options.tempUserModel = mongoose.model(options.tempUserCollection, tempUserSchema);
    //console.log("Temp User schema is -"+JSON.stringify(tempUserSchema));


    if (logLevel === "DEBUG") {
      logger.debug("generateTempUserModel Response - " + JSON.stringify(options.tempUserCollection));
    };
    return callback(null, mongoose.model(options.tempUserCollection));

  };






  // default options
  let options = {
   // verificationURL: 'https://www.myenergybuddy.com/account/email-verification/${URL}',
  // http://localhost:4200/activate?453463bb453dgd
    //verificationURL:'https://35.164.171.15/activate?${URL}',
    verificationURL:'https://www.myenergybuddy.com/activate?${URL}',
    URLLength: 48,

    // mongo-stuff
    persistentUserModel: User,
    //tempUserModel: generateTempUserModel,
    tempUserCollection: 'temporary_users',
    emailFieldName: 'email',
    passwordFieldName: 'password',
    URLFieldName: 'verificationtoken',
    expirationTime: 1800, //30 minutes

    transportOptions: {
      host: apiDetails.email.host,
      port: 465,
      secure: true, // use SSL
      auth: {
        user: apiDetails.email.user,
        pass: apiDetails.email.password
      }
    },
    verifyMailOptions: {
      from: apiDetails.email.sendermail,
      subject: 'Activate your www.myenergybuddy.com account',
      html: '<p>Please activate your account by clicking <a href="${URL}">this link</a>. Alternatively copy and ' +
        'paste the following link in your browser:</p><p>${URL}</p><p>This is an auto generated mail, Please dont reply</p>',
      text: 'Please activate your account by clicking the following link, or by copying and pasting it in your browser: ${URL}'

    },
    verifySendMailCallback: function (err, info) {
      const logger = getLogger('verifySendMailCallback');

      if (err) {
        //throw err;
        if (logLevel === "DEBUG") {
          logger.error(" verifySendMailCallback Error - " + err);
        }
        return err;

      } else {
        if (logLevel === "DEBUG") {
          logger.debug(" verifySendMailCallback Response - " + info.response);
        }
      }
    },
    shouldSendConfirmation: true,
    confirmMailOptions: {
      from: apiDetails.email.sendermail,
      subject: 'Account activated',
      html: '<p>Your www.myenergybuddy.com account is now active</p>',
      text: 'Your www.myenergybuddy.com account is now active'
    },
    confirmSendMailCallback: function (err, info) {
      const logger = getLogger('confirmSendMailCallback');

      if (err) {
        //throw err;
        return err;
      } else {
        if (logLevel === "DEBUG") {
          logger.debug("confirmSendMailCallback Response - " + info.response);
        }
      }
    },
    hashingFunction: null
  };


  let transporter;

  /**
   * Modify the default configuration.
   *
   * @func configure
   * @param {object} o - options to be changed
   */
  let configure = function (optionsToConfigure, callback) {
    const logger = getLogger('ModifyDefConf');

    for (let key in optionsToConfigure) {
      if (optionsToConfigure.hasOwnProperty(key)) {
        options[key] = optionsToConfigure[key];
      }
    }
   transporter = nodemailer.createTransport(options.transportOptions);


    let err;

    if (typeof options.verificationURL !== 'string') {
      err = err || createOptionError('verificationURL', options.verificationURL, 'string');
    } else if (options.verificationURL.indexOf('${URL}') === -1) {
      err = err || new Error('Verification URL does not contain ${URL}');
    }

    if (typeof options.URLLength !== 'number') {
      err = err || createOptionError('URLLength', options.URLLength, 'number');
    } else if (!isPositiveInteger(options.URLLength)) {
      err = err || new Error('URLLength must be a positive integer');
    }

    if (typeof options.tempUserCollection !== 'string') {
      err = err || createOptionError('tempUserCollection', options.tempUserCollection, 'string');
    }

    if (typeof options.emailFieldName !== 'string') {
      err = err || createOptionError('emailFieldName', options.emailFieldName, 'string');
    }

    if (typeof options.passwordFieldName !== 'string') {
      err = err || createOptionError('passwordFieldName', options.passwordFieldName, 'string');
    }

    if (typeof options.URLFieldName !== 'string') {
      err = err || createOptionError('URLFieldName', options.URLFieldName, 'string');
    }

    if (typeof options.expirationTime !== 'number') {
      err = err || createOptionError('expirationTime', options.expirationTime, 'number');
    } else if (!isPositiveInteger(options.expirationTime)) {
      err = err || new Error('expirationTime must be a positive integer');
    }

    if (err) {
      logger.debug("ModifyDefConf Error - " + err);
      return callback(err, null);
    }
    if (logLevel === "DEBUG") {
      logger.debug("ModifyDefConf Returning - " + JSON.stringify(options));
    }

    return callback(null, options);
  };





  /**
   * Helper function for actually inserting the temporary user into the database.
   *
   * @func insertTempUser
   * @param {string} password - the user's password, possibly hashed
   * @param {object} tempUserData - the temporary user's data
   * @param {function} callback - a callback function, which takes an error and the
   *   temporary user object as params
   * @return {function} returns the callback function
   */
  let insertTempUser = function (password, tempUserData, callback) {
    const logger = getLogger('insertTempUser');
    // password may or may not be hashed
    //console.log("insertTempUser :: tempUserData -"+ JSON.stringify(tempUserData));

    tempUserData[options.passwordFieldName] = password;
    let newTempUser = new options.tempUserModel(tempUserData);
    newTempUser.profile.firstName = tempUserData.profile.firstName !== undefined && tempUserData.profile.firstName.length > 0 ? tempUserData.profile.firstName : "";
    newTempUser.profile.lastName = tempUserData.profile.lastName !== undefined && tempUserData.profile.lastName.length > 0 ? tempUserData.profile.lastName : "";
    newTempUser.profile.fullname = tempUserData.profile.fullname !== undefined && tempUserData.profile.fullname.length > 0 ? tempUserData.profile.fullname : "";
    newTempUser.profile.phoneNumber = tempUserData.profile.phoneNumber !== undefined && tempUserData.profile.phoneNumber > 0 ? tempUserData.profile.phoneNumber : 0;
    newTempUser.profile.esiid = tempUserData.profile.esiid !== undefined && tempUserData.profile.esiid.length > 0 ? tempUserData.profile.esiid :"";
    newTempUser.profile.meterid = tempUserData.profile.meterid !== undefined && tempUserData.profile.meterid.length > 0 ? tempUserData.profile.meterid :"";
    newTempUser.profile.contractendingon = tempUserData.profile.contractendingon !== undefined && tempUserData.profile.contractendingon !=null? tempUserData.profile.contractendingon :null;
    newTempUser.profile.currentprovider = tempUserData.profile.currentprovider !== undefined && tempUserData.profile.currentprovider.length > 0 ? tempUserData.profile.currentprovider :"";

    newTempUser.profile.address={};
    newTempUser.profile.address.zipcode=tempUserData.profile.address.zipcode!== undefined && tempUserData.profile.address.zipcode > 0 ? tempUserData.profile.address.zipcode : 0;
    newTempUser.profile.address.address=tempUserData.profile.address.address!== undefined && tempUserData.profile.address.address.length > 0 ? tempUserData.profile.address.address :"";
    newTempUser.profile.address.residenceType=tempUserData.profile.address.residenceType!== undefined && tempUserData.profile.address.residenceType > 0 ? tempUserData.profile.address.residenceType :"";
    newTempUser.profile.address.duration=tempUserData.profile.address.duration!== undefined && tempUserData.profile.address.duration > 0 ? tempUserData.profile.address.duration : 0;
    newTempUser.profile.address.state=tempUserData.profile.address.state!== undefined && tempUserData.profile.address.state > 0 ? tempUserData.profile.address.state :"";
    newTempUser.profile.address.apartmentNumber=tempUserData.profile.address.apartmentNumber!== undefined && tempUserData.profile.address.apartmentNumber > 0 ? tempUserData.profile.address.apartmentNumber :"";


    newTempUser.category = {};
    newTempUser.category.categoryType = tempUserData.category.categoryType !== undefined && tempUserData.category.categoryType.length > 0 ? tempUserData.category.categoryType : "";
    
    newTempUser.status = {};
    newTempUser.status.esiidfetched=tempUserData.status.esiidfetched !== undefined  ? tempUserData.status.esiidfetched : false;
    newTempUser.status.meterfetched=tempUserData.status.meterfetched !== undefined  ? tempUserData.status.meterfetched : false;
    newTempUser.status.profilestat=tempUserData.status.profilestat !== undefined  ? tempUserData.status.profilestat : false;

    //console.log("insertTempUser :: newTempUser -"+ JSON.stringify(newTempUser));

    newTempUser.save(function (err, tempUser) {
      if (err) {
        return callback(err, null, null);
      }
      return callback(null, null, tempUser);
    });
  };


  /**
   * Attempt to create an instance of a temporary user based off of an instance of a
   * persistent user. If user already exists in the temporary collection, passes null
   * to the callback function; otherwise, passes the instance to the callback, with a
   * randomly generated URL associated to it.
   *
   * @func createTempUser
   * @param {object} user - an instance of the persistent User model
   * @param {function} callback - a callback function that takes an error (if one exists),
   *   a persistent user (if it exists) and the new temporary user as arguments; if the
   *   temporary user already exists, then null is returned in its place
   * @return {function} returns the callback function
   */
  let createTempUser = function (user, requestId, callback) {
    const logger = getLogger('createTempUser');

    if (!options.tempUserModel) {
      //console.log("createTempUser Temporary user model not defined ");
      logger.error("createTempUser Temporary user model not defined ");
      return callback(new TypeError('Temporary user model not defined. Either you forgot' +
        'to generate one or you did not predefine one.'), null);
    }

    // create our mongoose query
    let query = {};

    if (options.emailFieldName.split('.').length > 1) {
      let levels = options.emailFieldName.split('.');
      query[levels[0]] = {};

      let queryObj = query[levels[0]];
      let userObj = user[levels[0]];
      for (let i = 0; i < levels.length; i++) {
        queryObj[levels[i + 1]] = {};
        queryObj = queryObj[levels[i + 1]];
        userObj = userObj[levels[i + 1]];
      }

      queryObj = userObj;
    } else {
      query[options.emailFieldName] = user[options.emailFieldName];
    }

    logger.debug("createTempUser Temporary user search query is -"+JSON.stringify(query));


    options.persistentUserModel.findOne(query, function (err, existingPersistentUser) {
      if (err) {
        return callback(err, null, null);
      }

      // user has already signed up and confirmed their account
      if (existingPersistentUser) {
        return callback(null, existingPersistentUser, null);
      }

      options.tempUserModel.findOne(query, function (err, existingTempUser) {
        if (err) {
          return callback(err, null, null);
        }

        // user has already signed up but not yet confirmed their account
        if (existingTempUser) {
          return callback(null, null, null);
        } else {
          let tempUserData = {};

          // copy the credentials for the user
          Object.keys(user._doc).forEach(function (field) {
            tempUserData[field] = user[field];
          });

          tempUserData[options.URLFieldName] = randtoken.generate(options.URLLength);
          /*
                    console.log("Options Hashing function is -"+options.hashingFunction);
          
                    if (options.hashingFunction) {
                     //return options.hashingFunction(tempUserData[options.passwordFieldName], tempUserData,
                       // insertTempUser, callback);
                        //commenting this line as hashing needs to be fixed
                        console.log("Going to insert temp user as NULL  -"+JSON.stringify(tempUserData));
                        return insertTempUser(user[options.passwordFieldName], tempUserData, callback);
          
                    } else {
          
                              let hashedPassword;
                              bcrypt.genSalt(10, (err, salt) => {
                                if (err) { return next(err); }
                                bcrypt.hash(user[options.passwordFieldName], salt, null, (err, hash) => {
                                  if (err) { return err; }
                                  hashedPassword=hash
                                 console.log("Going to insert temp user 2-"+JSON.stringify(tempUserData));
          
                                  return insertTempUser(hash, tempUserData, callback);
          
                                });
                              });
          
                           // return insertTempUser(tempUserData[options.passwordFieldName], tempUserData, callback);
                    }*/

          //Going to encrypt the password Inserting in temp user
          let encryptionDecryptionObj = new encryptionDecryption();
          return insertTempUser(encryptionDecryptionObj.encrypt(tempUserData[options.passwordFieldName]), tempUserData, callback);
        }
      });
    });
  };


  /**
   * Check whether the user has verified his email.
   *
   * @func checkMailValidated
   * @param {string} email - the user's email address.
   */



  let checkMailValidated = function (email, requestId, callback) {
    const logger = getLogger('checkMailValidated');
    if (logLevel === "DEBUG") {
      logger.debug("requestId :: " + requestId + " :: checkMailValidated validating for -" + email);
    }
    let TempUser = options.tempUserModel,
      query = {};
    query[options.emailFieldName] = email;

    TempUser.findOne(query, function (err, tempUserData) {
      if (err) {
        logger.error("requestId :: " + requestId + " :: checkMailValidated find returning error  -" + err);
        return callback(err, null);
      }
      // temp user is found i.e user is not validated
      if (tempUserData) {
        tempUserData = "forbidden";
        if (logLevel === "DEBUG") {
          logger.debug("requestId :: " + requestId + " :: checkMailValidated user yet to validate -" + email);
        }
        return callback(null, tempUserData);
      } else {
        if (logLevel === "DEBUG") {
          logger.debug("requestId :: " + requestId + " :: checkMailValidated user had validated the given email -" + email);
        }
        tempUserData = "continue"
        return callback(null, tempUserData);
      }
    });
  };


  /**
   * Send an email to the user requesting confirmation.
   *
   * @func sendVerificationEmail
   * @param {string} email - the user's email address.
   * @param {string} url - the unique url generated for the user.
   * @param {function} callback - the callback to pass to Nodemailer's transporter
   */
  let sendVerificationEmail = function (email, url, callback) {
    const logger = getLogger('sendVerificationEmail');

    let r = /\$\{URL\}/g;


    // inject newly-created URL into the email's body and FIRE
    // stringify --> parse is used to deep copy
    let URL = options.verificationURL.replace(r, url),
      mailOptions = JSON.parse(JSON.stringify(options.verifyMailOptions));

    mailOptions.to = email;
    mailOptions.html = mailOptions.html.replace(r, URL);
    mailOptions.text = mailOptions.text.replace(r, URL);

    try {
      if (!callback) {
        callback = options.verifySendMailCallback;
      }
      transporter.sendMail(mailOptions, callback);
    } catch (err) {
      logger.error("Caught an exception while sending email  -" + err);
      return callback(err, null, null);
    }

  };

  /**
   * Send an email to the user requesting confirmation.
   *
   * @func sendConfirmationEmail
   * @param {string} email - the user's email address.
   * @param {function} callback - the callback to pass to Nodemailer's transporter
   */
  let sendConfirmationEmail = function (email, callback) {
    const logger = getLogger('sendConfirmationEmail');

    let mailOptions = JSON.parse(JSON.stringify(options.confirmMailOptions));
    mailOptions.to = email;
    try {
      if (!callback) {
        callback = options.confirmSendMailCallback;
      }
      transporter.sendMail(mailOptions, callback);
    } catch (err) {
      logger.error("Caught an exception while sending Confirmation email  -" + err);
      return callback(err, null, null);
    }
  };

  /**
   * Transfer a temporary user from the temporary collection to the persistent
   * user collection, removing the URL assigned to it.
   *
   * @func confirmTempUser
   * @param {string} url - the randomly generated URL assigned to a unique email
   */
  let confirmTempUser = function (url, callback) {
    const logger = getLogger('confirmTempUser');

    let TempUser = options.tempUserModel,
      query = {};
    query[options.URLFieldName] = url;

    TempUser.findOne(query, function (err, tempUserData) {
      if (err) {
        return callback(err, null);
      }

      // temp user is found (i.e. user accessed URL before their data expired)
      if (tempUserData) {
        let userData = JSON.parse(JSON.stringify(tempUserData)), // copy data
          User = options.persistentUserModel,
          user;

        delete userData[options.URLFieldName];
        user = new User(userData);

        // save the temporary user to the persistent user collection
        user.save(function (err, savedUser) {
          if (err) {
            return callback(err, null);
          }

          TempUser.remove(query, function (err) {
            if (err) {
              return callback(err, null);
            }

           /*commenting as email was being sent twice
           if (options.shouldSendConfirmation) {
              sendConfirmationEmail(savedUser[options.emailFieldName], null);
            }*/
            return callback(null, user);
          });
        });


        // temp user is not found (i.e. user accessed URL after data expired, or something else...)
      } else {
        return callback(null, null);
      }
    });
  };


  /**
   * Resend the verification email to the user given only their email.
   *
   * @func resendVerificationEmail
   * @param {object} email - the user's email address
   */
  let resendVerificationEmail = function (email, callback) {
    const logger = getLogger('resendVerificationEmail');

    let query = {};
    query[options.emailFieldName] = email;

    options.tempUserModel.findOne(query, function (err, tempUser) {
      if (err) {
        return callback(err, null);
      }

      // user found (i.e. user re-requested verification email before expiration)
      if (tempUser) {
        // generate new user token
        tempUser[options.URLFieldName] = randtoken.generate(options.URLLength);
        tempUser.save(function (err) {
          if (err) {
            return callback(err, null);
          }

          sendVerificationEmail(getNestedValue(tempUser, options.emailFieldName), tempUser[options.URLFieldName], function (err) {
            if (err) {
              return callback(err, null);
            }
            return callback(null, true);
          });
        });

      } else {
        return callback(null, false);
      }
    });
  };


  return {
    options: options,
    configure: configure,
    generateTempUserModel: generateTempUserModel,
    createTempUser: createTempUser,
    confirmTempUser: confirmTempUser,
    resendVerificationEmail: resendVerificationEmail,
    sendConfirmationEmail: sendConfirmationEmail,
    sendVerificationEmail: sendVerificationEmail,
    checkMailValidated: checkMailValidated
  };
};
