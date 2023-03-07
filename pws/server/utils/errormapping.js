var errormapping = function () {
    return {
        createMetadata: {
            3060: {
                resCode: "500-CRP-001",
                resDesc: "Plan Creation Failed"
            },

            500: {
                resCode: "500-CRP-002",
                resDesc: "Create Plan Server error"
            }

        },
        metaDataList: {
            500: {
                resCode: "500-MDL-001",
                resDesc: "Error while fetching config data"
            },
            204: {
                resCode: "204-MDL-001",
                resDesc: "Config failed to be fetched, due to wrong search key"
            }
        },
        authentication: {
            3070: {
                resCode: "500-AUTH-001",
                resDesc: "Unable to find user with the provided authorization"
            },
            500: {
                resCode: "500-AUTH-002",
                resDesc: "Internal Server error"
            },
            401: {
                resCode: "401-AUTH-001",
                resDesc: "Token validation failure,forbidden"
            },
            402: {
                resCode: "401-AUTH-002",
                resDesc: "Authentication Failure, Session Expired"
            },
            501: {
                resCode: "500-AUTH-003",
                resDesc: "Fatal error while authenticating, cannot proceed"
            }

        },
        updateReference: {
            3000: {
                resCode: "500-UPR-001",
                resDesc: "Update failed due to library error"
            },
            3010: {
                resCode: "500-UPR-002",
                resDesc: "Failed to update reference time"
            },
            3020: {
                resCode: "500-UPR-003",
                resDesc: "DB Exception encountered"
            },

            500: {
                resCode: "500-UPR-004",
                resDesc: "Update Reference Server error"
            }
        },
        getMetadata: {
            3070: {
                resCode: "204-QRP-001",
                resDesc: "No Plans found"
            },

            500: {
                resCode: "500-QRP-002",
                resDesc: "Internal Server error"
            }
        },
        getRefTime: {
            3070: {
                resCode: "204-GRT-001",
                resDesc: "No Reference found"
            },

            500: {
                resCode: "500-GRT-002",
                resDesc: "Internal Server error"
            }
        },
        bestRates: {
            3070: {
                resCode: "204-BRT-001",
                resDesc: "No TDU found found for the ZIP"
            },

            500: {
                resCode: "500-BRT-002",
                resDesc: "Internal Server error"
            },
            501: {
                resCode: "500-BRT-003",
                resDesc: "No TDU server the ZIP"
            },
            502: {
                resCode: "500-BRT-004",
                resDesc: "Invalid Texas ZipCode "
            },            
            503: {
                resCode: "500-BRT-005",
                resDesc: "Input must be between 1 and 10000 kWh"
            }
        },
        deleteMetadata: {
            500: {
                resCode: "500-DLP-001",
                resDesc: "Aborting Plan Deletion due to error"
            },
            204: {
                resCode: "204-DLP-002",
                resDesc: "No record found for deletion"
            },
            3030: {
                resCode: "500-DLP-003",
                resDesc: "Error while deleting Plan"
            },
            3050: {
                resCode: "500-DLP-004",
                resDesc: "Fatal Error while deleting Plan , Check Log!"
            }
        },
        truncate: {
            500: {
                resCode: "500-TRUNC-001",
                resDesc: "Aborting Collection Truncation due to error"
            },
            3060: {
                resCode: "500-TRUNC-002",
                resDesc: "Error while Truncating Collection"
            }
        },
        fetchfromsmt:{
            500: {
                resCode: "500-FFSMT-001",
                resDesc: "Aborting due to failure while fetching user details from SMT"
            },
            400: {
                resCode: "400-FFSMT-001",
                resDesc: "SMT dint get an approval from the ESIID to fetch data"
            }
        },
        fetchesiid:{
            400: {
                resCode: "400-FESIID-001",
                resDesc: "Address should contain only [A-Z a-z 0-9]"
            },
            401: {
                resCode: "400-FESIID-001",
                resDesc: "Supported Premise type Residential|Commercial"
            },
            501: {
                resCode: "500-FESIID-001",
                resDesc: "Invalid Texas ZipCode "
            },
            502: {
                resCode: "500-FESIID-002",
                resDesc: "Failed to fetch ESIID"
            },
        },
        scalarusage:{
            501: {
                resCode: "500-SCUSG-001",
                resDesc: "Exception while generating predicted usage"
            }
        },
        premiseDetails:{
            500: {
                resCode: "500-PDSMT-001",
                resDesc: "Aborting due to failure while fetching premise details from SMT"
            }
        },
        meterDetails:{
            500: {
                resCode: "500-MDSMT-001",
                resDesc: "Aborting due to failure while fetching meter details from SMT"
            },
            400: {
                resCode: "400-MDSMT-001",
                resDesc: "Approval required to fetch meter informaiton form SMT"
            }
        },      
        agreement:{
            500: {
                resCode: "500-AGSMT-001",
                resDesc: "Aborting due to failure while submitting agreement to SMT"
            }
        },
        new_agreement_status:{
            500: {
                resCode: "500-STAGM-001",
                resDesc: "Aborting due to failure while fetching agreement status from SMT"
            },
            501: {
                resCode: "500-STAGM-001",
                resDesc: "SMT Responded as Bad Request"
            },
            502: {
                resCode: "500-STAGM-002",
                resDesc: "SMT dint get an approval from the ESIID to fetch data"
            },
            404: {
                resCode: "404-STAGM-001",
                resDesc: "Data Sharing agreement is unacknowledged/pending"
            },
        },
        httpcall: {
            500: {
                resCode: "500-HTTP-001",
                resDesc: "HTTP Request failed"
            },
            501: {
                resCode: "500-HTTP-002",
                resDesc: "Exception occured while making HTTP request "
            }
        },
        httpscall: {
            500: {
                resCode: "500-HTTPS-001",
                resDesc: "HTTPS response error"
            },
            501: {
                resCode: "500-HTTPS-002",
                resDesc: "HTTPS response non ending error"
            },
            502: {
                resCode: "500-HTTPS-003",
                resDesc: "HTTPS request error"
            },
            503: {
                resCode: "500-HTTPS-004",
                resDesc: "HTTPS request timeout"
            },
            504: {
                resCode: "500-HTTPS-005",
                resDesc: "HTTPS socket timeout"
            },
            505: {
                resCode: "500-HTTPS-006",
                resDesc: "Exception occured while making HTTPS request "
            },
            400: {
                resCode: "400-HTTPS-001",
                resDesc: "SMT dint get an approval from the ESIID to fetch data"
            },
            401: {
                resCode: "401-HTTPS-001",
                resDesc: "SMT responded as Bad Request"
            },
            402: {
                resCode: "402-HTTPS-001",
                resDesc: "Precondition to SMT failed, please check ESIID-METER-REP Combination"
            },

        },
        tempSignUp:{
            200:{
                resCode: "200-TUS-001",
                resDesc: "Activation mail sent,kindly activate your account"
            },
            201:{
                resCode: "200-TUS-002",
                resDesc: "User successfully activated"
            },
            401:{
                resCode: "400-TUS-001",
                resDesc: "Registration Data Validation Error"
            },
            402:{
                resCode: "400-TUS-002",
                resDesc: "Registration Data Sanity Failed"
            },
            403:{
                resCode: "400-TUS-003",
                resDesc: "Invalid format of Email/Password"
            },
            404:{
                resCode: "400-TUS-004",
                resDesc: "Temporary user registration failed"
            },
            405:{
                resCode: "400-TUS-005",
                resDesc: "An account with the provided email already exists"
            },
            406:{
                resCode: "400-TUS-006",
                resDesc: "You have already signed up. Please check your email to verify your account"
            },
            407:{
                resCode: "400-TUS-007",
                resDesc: "Invalid email format"
            },
            408:{
                resCode: "400-TUS-008",
                resDesc: "Password must be 6-10 characters long"
            },
            409:{
                resCode: "400-TUS-009",
                resDesc: "Passwords do not match"
            },
            410:{
                resCode: "400-TUS-010",
                resDesc: "First name is Mandatory"
            },
            411:{
                resCode: "400-TUS-011",
                resDesc: "Last name is Mandatory"
            },
            501:{
                resCode: "500-TUS-001",
                resDesc: "Sequence generation error"
            },
            502:{
                resCode: "500-TUS-002",
                resDesc: "Failed to send Verification mail"
            },
            503:{
                resCode: "500-TUS-003",
                resDesc: "Fatal error user signup "
            },
            504:{
                resCode: "500-TUS-004",
                resDesc: "User activation failed"
            },
            505:{
                resCode: "500-TUS-005",
                resDesc: "Fatal error during account verification"
            }

        },
        forgotpassword:{
            200:{
                resCode: "200-FPWD-001",
                resDesc: "Password reset mail sent"
            },
            501:{
                resCode: "501-FPWD-001",
                resDesc: "Internal DB Error"
            },
            501:{
                resCode: "501-FPWD-002",
                resDesc: "Invalid email"
            },
            502:{
                resCode: "502-FPWD-001",
                resDesc: "Error while sending mail"
            },
            503:{
                resCode: "503-FPWD-001",
                resDesc: "Fatal operation error ,check logs"
            },
            204:{
                resCode: "204-FPWD-001",
                resDesc: "Unable to find a matching email id for password reset"
            }
        },
        changepassword:{
            501:{
                resCode: "501-CPWD-001",
                resDesc: "Internal DB Error"
            },
            502:{
                resCode: "502-CPWD-001",
                resDesc: "Error while sending confirmation mail for password change"
            },
            503:{
                resCode: "503-CPWD-001",
                resDesc: "Fatal operation error , check logs"
            },
            504:{
                resCode: "504-CPWD-001",
                resDesc: "Reset token provided for password change is expired"
            },
            200:{
                resCode: "200-CPWD-001",
                resDesc: "Password change success, please check your email"
            },
            204:{
                resCode: "204-CPWD-001",
                resDesc: "Unable to find a matching profile for password reset"
            },
            401:{
                resCode: "401-CPWD-001",
                resDesc: "Unauthorised to access the services"
            },
            403:{
                resCode: "403-CPWD-001",
                resDesc: "Forbidden, kindly authenticate"
            },
            400:{
                resCode: "400-CPWD-001",
                resDesc: "Password policy not fulfilled"
            },
            402:{
                resCode: "402-CPWD-001",
                resDesc: "Validation Failure. Old Password Doesnt match"
            }
        },
        login:{
            204:{
                resCode: "204-PL-001",
                resDesc: "Unable to find a matching email"
            },
            401:{
                resCode: "401-PL-001",
                resDesc: "Unauthorised, to access the services"
            },
            403:{
                resCode: "403-PL-001",
                resDesc: "Incorrect Password, please retry"
            },
            501:{
                resCode: "501-PL-001",
                resDesc: "Fatal Error Cannot Proceed"
            },
            500:{
                resCode: "500-PL-001",
                resDesc: "Fatal Error, check server log"
            },
            502:{
                resCode: "502-PL-001",
                resDesc: "Exception, Cannot proceed !check server log"
            },
            503:{
                resCode: "503-PL-001",
                resDesc: "Fatal error while executing asyncronous operation"
            },
            3000: {
                resCode: "500-PL-001",
                resDesc: "Update failed due to library error"
            },
            3010: {
                resCode: "500-PL-002",
                resDesc: "Failed to update reference time"
            },
            3020: {
                resCode: "500-PL-003",
                resDesc: "DB Exception encountered"
            },
        },
        sequenceNumber: {
            501: {
                resCode: "500-SNUM-001",
                resDesc: "Sequence Number Generation "
            },

            502: {
                resCode: "500-SNUM-002",
                resDesc: "Error while generating Sequence Number"
            }

        },
        logout:{
            200:{
                resCode: "200-LOUT-001",
                resDesc: "Logout success"
            },
            501:{
                resCode: "500-LOUT-001",
                resDesc: "Unable to logout the user"
            },
            502:{
                resCode: "500-LOUT-002",
                resDesc: "Invalid format cannot proceed"
            },
            503:{
                resCode: "500-LOUT-003",
                resDesc: "Exception while logging out user"
            },
            3000: {
                resCode: "500-LOUT-004",
                resDesc: "Update failed due to library error"
            },
            3010: {
                resCode: "500-LOUT-005",
                resDesc: "Failed to update reference time"
            },
            3020: {
                resCode: "500-LOUT-006",
                resDesc: "DB Exception encountered"
            }
        },
        updateprofile: {
            422: {
                resCode: "422-UPR-000",
                resDesc: "Rejecting, empty payload received for update"
            },
            401: {
                resCode: "401-UPR-000",
                resDesc: "Unable to find a matching profile for update"
            },
            200: {
                resCode: "200-UPR-000",
                resDesc: "Profile updation success"
            },
            500: {
                resCode: "500-UPR-000",
                resDesc: "Exception while updating profile information"
            },
            501: {
                resCode: "501-UPR-001",
                resDesc: "Error in updating profile information"
            },
            502: {
                resCode: "502-UPR-001",
                resDesc: "Fatal exception check log for details"
            },
            201: {
                resCode: "201-UPR-001",
                resDesc: "Profile created with empty ESIID,Unable to get an ESIID for the address provided"
            },
            202: {
                resCode: "202-UPR-001",
                resDesc: "Profile updated without Meter Id,SMT rejected the request.Please check ESIID and Meter ID combination "
            },
            203: {
                resCode: "203-UPR-001",
                resDesc: "Pending - Customer Authorization, Kindly acknowledge"
            },
            205: {
                resCode: "205-UPR-001",
                resDesc: "Active - Authorization Confirmed, Congratulation"
            },
            
        },
        getprofile: {
            401: {
                resCode: "401-GPR-000",
                resDesc: "Unable to find a matching profile"
            },
            500: {
                resCode: "500-GPR-000",
                resDesc: "Exception while fetching profile information"
            },
            501: {
                resCode: "501-GPR-001",
                resDesc: "Error in fetching profile information"
            },
            502: {
                resCode: "502-GPR-001",
                resDesc: "Fatal exception check log for details"
            }
            
        },
    }
}

module.exports = new errormapping();
