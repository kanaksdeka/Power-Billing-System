var config = require('../../config/environment');

/**
 * [API Configurations]
 * @type {Object}
 */
var api_config = {
    "PTU_MONGODB_URL": config.mongo_url,
    "PTU_API_URL": config.ptu_data_service_url,
    "default_language": "en",
    "mock": config.mock,
    "API_TIME_OUT": config.timeout,
    "LOG_LEVEL": config.logLevel,
    "TTL": config.ttl,
    "opco": {
        country: config.opco.country,
        currency: config.opco.currency
    },
    "email": {
        host: config.email.host,
        user: config.email.user,
        password: config.email.password,
        sendermail: config.email.sendermail
    },
    "TDB_HOST_IP": config.tdb_hostIP,
    "TDB_USER_NAME": config.tdb_username,
    "TDB_PASSWORD": config.tdb_password,
    "TDB_DB_NAME": config.tdb_name,
    "ZIP_CODE": config.zip_code,
    "ESIID": {
        url: config.esiid.url,
        key: config.esiid.key,
        format: config.esiid.format
    },
    "SMT": {
        certficate: {
            hostname: config.smt.certificate.hostname,
            cert: config.smt.certificate.cert,
            key: config.smt.certificate.key
        },
        user: {
            requestorID: config.smt.user.requestorID,
            requesterType: config.smt.user.requesterType,
            requesterAuthenticationID: config.smt.user.requesterAuthenticationID,
            auth: {
                user: config.smt.user.auth.user,
                pass: config.smt.user.auth.pass
            }
        },
        monthly_read: {
            url: config.smt.monthly_read.url,
            method: config.smt.monthly_read.method
        },
        new_agreement: {
            url: config.smt.new_agreement.url,
            method: config.smt.new_agreement.method
        },
        new_agreement_status: {
            url: config.smt.new_agreement_status.url,
            method: config.smt.new_agreement_status.method
        },
        premise_info: {
            url: config.smt.premise_info.url,
            method: "POST"
        },
        meter_info: {
            url: config.smt.meter_info.url,
            method: "POST"
        }
    },
    "TDU": {
        ATCC: {
            id: "ELSQL01DB1245281100002",
            name: "AEP TEXAS CENTRAL COMPANY",
            TDSP_DUNS_NUMBER: "007924772",
            TDU_BASE_RATE: '9.00',
            TDU_VAR_RATE: '.0408610'
        },
        ATNC: {
            id: "ELSQL01DB1245281100003",
            name: "AEP TEXAS NORTH COMPANY",
            TDSP_DUNS_NUMBER: "007923311",
            TDU_BASE_RATE: '10.53',
            TDU_VAR_RATE: '.0388240'
        },
        CP: {
            id: "ELSQL01DB1245281100004",
            name: "CENTERPOINT ENERGY HOUSTON ELECTRIC LLC",
            TDSP_DUNS_NUMBER: "957877905",
            TDU_BASE_RATE: '5.47',
            TDU_VAR_RATE: '.0344580'

        },
        OEDC: {
            id: "ELSQL01DB1245281100006",
            name: "ONCOR ELECTRIC DELIVERY COMPANY",
            TDSP_DUNS_NUMBER: "1039940674000",
            TDU_BASE_RATE: '3.42',
            TDU_VAR_RATE: '.0354480'
        },
        TMPC: {
            id: "ELSQL01DB1245281100008",
            name: "TEXAS-NEW MEXICO POWER COMPANY",
            TDSP_DUNS_NUMBER: "007929441",
            TDU_BASE_RATE: '7.85',
            TDU_VAR_RATE: '.0413540'
        }
    },
    "SCALARREF": {
        scales: [{
            month: "January",
            ind: 1,
            scalarindex: 1
        },
        {
            month: "February",
            ind: 2,
            scalarindex: 0.852388995
        },
        {
            month: "March",
            ind: 3,
            scalarindex: 0.71672321
        },
        {
            month: "April",
            ind: 4,
            scalarindex: 0.695392387
        },
        {
            month: "May",
            ind: 5,
            scalarindex: 0.813992718
        },
        {
            month: "June",
            ind: 6,
            scalarindex: 1.118600331
        },
        {
            month: "July",
            ind: 7,
            scalarindex: 1.442832022
        },
        {
            month: "August",
            ind: 8,
            scalarindex: 1.439419528
        },
        {
            month: "September",
            ind: 9,
            scalarindex: 1.25511899
        },
        {
            month: "October",
            ind: 10,
            scalarindex: 0.985994166
        },
        {
            month: "November",
            ind: 11,
            scalarindex: 0.75017
        },
        {
            month: "December",
            ind: 12,
            scalarindex: 0.8566
        },


        ]
    }


}
module.exports = api_config;

