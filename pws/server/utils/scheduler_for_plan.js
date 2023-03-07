var cron= require('node-schedule');
const request = require('request');
const fs=require('fs');

/* This runs at 23:00PM every Friday, Saturday and Sunday. */
var planRule = new cron.RecurrenceRule();
//planRule.dayOfWeek = [1,2,3,4,5, 6, 0];
planRule.dayOfWeek = [1,3,5,0];
planRule.hour = 23;
planRule.minute = 20;
cron.scheduleJob(planRule, function () {

    const options = {
        url: 'https://myenergybuddy.com/getplan',
        method: 'GET',
    	cert: fs.readFileSync('/home/ec2-user/mypowerbuddy/pws/server/certificate/77967cea80deba14.crt'),
    	key: fs.readFileSync('/home/ec2-user/mypowerbuddy/pws/server/certificate/_private.key'),
    	ca: fs.readFileSync('/home/ec2-user/mypowerbuddy/pws/server/certificate/gd_bundle-g2-g1.crt'),
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'Content-Type': 'application/json',
   	    'strictSSL': 'false'
        }
    };
    try {
        request(options, function (err, res, body) {
	    if(err)
		console.log("Error is -"+err)
	    if(res)
		console.log("Res is -"+JSON.stringify(res))
	    if(body)
		console.log("Body is -"+JSON.stringify(body))
            console.log("DB updated at -" + new Date());
        });
    } catch (error) {
        console.log("Error on -" + new Date + ":: Dec -" + JSON.stringify(error))
    }




});
