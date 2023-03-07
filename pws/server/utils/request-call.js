const fs = require('fs');
const request = require('request');
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var rootCas = require('ssl-root-cas').create();
//rootCas.addFile('/home/ec2-user/cer/certificate/ca-chain.cert.pem') 
rootCas.addFile('/home/ec2-user/cer/certificate/ca-cert.pem')
//request.globalAgent.options.ca = rootCas;
//



let myCertFile = fs.readFileSync('/home/ec2-user/cer/certificate/www.myenergybuddy.com.cert.pem');
let myKeyFile = fs.readFileSync('/home/ec2-user/cer/certificate/www.myenergybuddy.com.key.pem');
//let myCaFile = fs.readFileSync('/home/ec2-user/cer/certificate/ca-chain.cert.pem');
let myCaFile = fs.readFileSync('/home/ec2-user/cer/certificate/ca-cert.pem');


 
var options = {
   rejectUnauthorized: false,
    url: 'https://uatservices.smartmetertexas.net/monthlybillingInformation/',
    //path:'/monthlybillingInformation/',
    key: myKeyFile,
    cert: myCertFile,
    passphrase: 'energybuddy!0123',
    ca: myCaFile,
    auth: {
        username: 'SMTCSPTESTAPIACCOUNT13',
        password: 'smt2.0passw0rd'
    },
    method:'POST',
    headers: {
       'Content-Type': 'application/json',
      //'Authorization':'Basic U01UQ1NQVEVTVEFQSUFDQ09VTlQxMzpzbXQyLjBwYXNzdzByZA==',
       //'Authorization': 'Basic ' + new Buffer('SMTCSPTESTAPIACCOUNT13' + ':' +'smt2.0passw0rd').toString('base64'),
      // 'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
     },
};
 var jsonObject = JSON.stringify(
{
"trans_id": "111",
"requestorID": "SMTCSPTESTAPIACCOUNT13",
"requesterType": "CSP",
"requesterAuthenticationID":"122501123",
"startDate": "08/15/2018",
"endDate": "08/20/2019",
"version": "L",
"readingType": "c",
"esiid": [
"90000000000000046"
],
"SMTTermsandConditions": "Y"
});
options.body = jsonObject;

//console.log("Option is now -"+JSON.stringify(options)) ;
request(options,function(err,res,body){
  if (err) {
        console.log("Error is -"+err);
        console.log("Response -" +res);
  }else{
  //    console.log(res);
        console.log("Body is -"+ body); 
        console.log("Res is -"+ JSON.stringify(res)); }
});
