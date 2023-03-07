'use strict';

// Development specific configuration
let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
let encryptionDecryption = require(path.join(appRoot, '/utils/aes-encryption-decryption.js'));
//let encryptionDecryptionObj = new encryptionDecryption();
//let enecryptedPassword = encryptionDecryptionObj.encrypt('hms');
//console.log("enecryptedPassword----------------------"+enecryptedPassword);

let db_username = '';
let db_password =''; //Encrypted Passwords
let db_replicaset = '127.0.0.1:27017';

let db_name = 'MEB-DB';
let replicaName = ''
let db_config = '';

if(replicaName && replicaName !== ''){
    db_config = db_name +'?replicaSet='+replicaName;
}else{
    db_config = db_name;
}
let geturl = function() {
    let url;
    if (db_username && db_username !== '') {
        let encryptionDecryptionObj = new encryptionDecryption();
        let decryptedPassword = encryptionDecryptionObj.decrypt(db_password);
            console.log("decryptedPassword"+ decryptedPassword);
        url = 'mongodb://' +
            db_username +
            ':' +
            decryptedPassword +
            '@' +
            db_replicaset +
            '/' +
            db_config
    } else {
        url = 'mongodb://' +
            db_replicaset +
            '/' +
            db_config
    }
    console.log('url  ' + url);

    return url;
};

let url = geturl();
module.exports = {
    mongo_url: url,
    mock:false,
    timeout:60000,
    logLevel: "DEBUG",
    ttl:1, //Token expiry is set to 1 hours
    email:{
        host:'smtp.gmail.com',
        user: 'hello@myenergybuddy.com',
        password: '1!Password',
        sendermail:'hello@myenergybuddy.com',
    },
    opco:{
        country: "US",
        currency: "USD"
    },
    tdb_hostIP : '127.0.0.1',
    tdb_username: 'root',
    tdb_password: 'Bangalore',
    tdb_name: 'POWER_DB',
    zip_code: ['78664','77590','78521','76904','77573'],
    ptu_data_service_url:"http://powertochoose.org/en-us/service/v1/",
    esiid:{
        url:'http://apis.esiids.com/tx/meter_search/api_key/',
        key:'7fb60839f5be135a3eceeec857513a066f08e104',
        //key:'7fb60839f5be135a3eceeec857513a066f08e104hello',
        format:'json'
    },  
    smt:{
        certificate:{
            //hostname: 'uatservices.smartmetertexas.net',
            hostname: 'services.smartmetertexas.net',
           
            //prod
                cert:'/home/ec2-user/cer/prod_go_daddy_cer_renewed_2021/90474f81028c2a4e.pem', //this file name is renamed to avoid code change under the certificate folder used by the app
                key:'/home/ec2-user/cer/prod_go_daddy_cer_renewed_2021/dec_www.myenergybuddy.com.key.key',

            //Dev
                //cert:'/home/ec2-user/cer/certificate/www.myenergybuddy.com.cert.pem',
                //key:'/home/ec2-user/cer/certificate/dec_www.myenergybuddy.com.key.key',
            //local
                //cert:'/home/pasidhy/certificate/www.myenergybuddy.com.cert.pem',
                //key:'/home/pasidhy/certificate/dec_www.myenergybuddy.com.key.key'
        },
        user:{
            requestorID: "byiggapi",
           // requestorID: "SMTCSPTESTAPIACCOUNT13",
            requesterType: "CSP",
            requesterAuthenticationID:"122501123",
            auth:{
               // user: "SMTCSPTESTAPIACCOUNT13",
               // pass:"smt2.0passw0rd" 
                user: "byiggapi",
                pass:"api@byigg.com" 
            }
        },
        monthly_read:{
            url:"/monthlybillingInformation/",
            method:"POST"
        },
        new_agreement:{
            url:"/NewAgreement/",
            method:"POST"
        },
        new_agreement_status:{
            url:"/myagreements/",
            method:"POST"
        },
        premise_info:{
            url:"/premiseInfo/",
            method:"POST"
        },
        meter_info:{
            url:"/meterInfo/",
            method:"POST"
        }

    }
};

