import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constants } from './constants';
import { DummyData } from './dummydata.service';
import { of } from 'rxjs';
import { AppService } from './app.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class LoginService implements OnInit {
    restURL = '';
    providersMap;
    providersMapWithKey = {};
    private _resetToken;
    private _prividerFetched = false;
    private _activationWindoFalf = false;

    constructor(private http: HttpClient,
        private constants: Constants,
        private dummyData: DummyData,
        private appService: AppService,
        private router: Router,
        private cookiService: CookieService
    ) {
        this.restURL = constants.restURL;
    }

    ngOnInit() {
        console.log('LoginService ngOnInit()');
        //this.getProviders();
    }

    public get resetToken() {
        return this._resetToken;
    }
    public set resetToken(value) {
        this._resetToken = value;
    }

    public get activationWindoFalf() {
        return this._activationWindoFalf;
    }
    public set activationWindoFalf(value) {
        this._activationWindoFalf = value;
    }

    login(userName, password) {
        let req = {
            "password": password,
            "email": userName
        };

        console.log("payload", req);
        return this.http.post<any>(this.restURL + "account/login", req);
    }

    logout() {
        console.log('Service logout()');
        let req = {}

        let emptyData = {
            profile: {},
            status: {}
        }
        this.appService.setLoginDetails(emptyData)
        this.cookiService.set('ebtoken', '');

        this.router.navigate(['/home']);

        let res = this.http.post<any>(this.restURL + "account/logout", req);
        console.log('Service logout() response: ', res);
        return true;
    }

    changePass(oldPassword, newPassword) {

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'authorization': this.appService.getToken()
            })
        };

        let req = {
            "currentpassword": '123',
            "newpassword": oldPassword,
            "confirmpassword": newPassword
        };

        console.log("Service change pass payload", req);
        return this.http.post<any>(this.restURL + "account/change/profile/password", req, httpOptions);
    }

    resetChangePass(oldPassword, newPassword) {

        let req = {
            "resettoken": this._resetToken,
            "newpassword": oldPassword,
            "confirmpassword": newPassword
        };

        console.log("Service resetChangePass payload", req);
        return this.http.post<any>(this.restURL + "account/change/password", req);
    }

    forgotPass(email) {
        let req = {
            "email": email
        };

        console.log("payload", req);
        let res = this.http.post<any>(this.restURL + "account/reset/password", req);
        console.log("forgotPass response: ", res);
        return res;
    }

    signUp(formData) {
        let req = {
            "email": formData.email,
            "password": formData.password,
            "confirmPassword": formData.confirmPassword,
            "firstName": formData.firstName,
            "lastName": formData.lastName
        };

        console.log("payload", req);
        return this.http.post<any>(this.restURL + "account/temp/signup", req);
    }

    getMeterDetails(zip, address, premisesType) {
        console.log("getMeterDetails", zip, address, premisesType);

        let req = {
            zipcode: zip,
            address: address,
            premise_type: premisesType
        }
        return this.http.post<any>(this.restURL + "esiid/meter", req);
        //return of(this.dummyData.addressList).pipe();
    }

    saveOnboardingDetails(data) {
        console.log('Service saveOnboardingDetails()', data);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'authorization': this.appService.getToken()
            })
        };
        let req = {
            update: data
        }
        return this.http.post<any>(this.restURL + "account/profile/complete", data, httpOptions);
    }

    activate(data) {
        console.log('Service activate()', data);
        return this.http.get<any>(this.restURL + "account/email-verification/" + data);
    }

    setProvidersKey(providerList) {
        this.providersMapWithKey = {};

        for (let i = 0; i < providerList.length; i++) {
            this.providersMapWithKey[providerList[i].company_id] = providerList[i]
        }
    }

    getProviderWithKey(key) {
        return this.providersMapWithKey[key];
    }

    getProviders() {

        if (this._prividerFetched) {
            return;
        }

        console.log('Service getProviders()');
        let providersPromise = this.http.get<any>(this.restURL + "system/config/1");
        providersPromise.subscribe(
            (res) => {
                console.log('Success getProviders()', res);
                this.providersMap = res.data;
                this.setProvidersKey(res.data);

                this._prividerFetched = true;
            },
            (err) => {
                console.log('Failed actgetProvidersivate()', err);
            }
        )
    }

    /* get login details onluy with the token */
    async getLoginDetails(isGoToDashboard, skipConfirmEmailPage, skipOnboardingPage: boolean = false, directlyGoToDefaultDashboard: boolean = false) {
        console.log('Service getLoginDetails() start');
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'authorization': this.appService.getToken()
            })
        };
        let req = {
        }

        let response;

        try {
            response = await this.http.post<any>(this.restURL + "account/profile/fetch", req, httpOptions).toPromise()
            console.log('Service getLoginDetails() api call completed, resopnse:', response);
        }
        catch (error) {
            console.log('Service getLoginDetails() api call completed with error:', error);
            this.logout();
        }

        if (!response || !response.status) {
            this.appService.setTokenAfterRefresh('');
            this.logout();
        }

        this.appService.setLoginDetails(response, false);

        if (isGoToDashboard) {
            setTimeout(() => {
                this.goToDashboard(skipConfirmEmailPage, skipOnboardingPage, directlyGoToDefaultDashboard);
            }, 200);
        }

        return this.appService.status.profilestat;
    }

    agreementStatus() {
        console.log('Service agreementStatus()');

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'authorization': this.appService.getToken()
            })
        };

        let req = {};

        return this.http.post<any>(this.restURL + "smt/new/agreement/status", req, httpOptions);
    }

    updateEsiId(esiid) {
        console.log('Service updateEsiId()', esiid);

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'authorization': this.appService.getToken()
            })
        };

        let profile = this.appService.profile;
        let req = {
            update: {
                firstName: '',
                lastName: '',
                email: this.appService.email,
                esiid: esiid,
                meterid: '',
                contractendingon: '',
                currentprovider: ''
            }
        }
        return this.http.post<any>(this.restURL + "account/profile/update", req, httpOptions);
    }

    prepareRequest(data) {

    }

    updateProfile(data) {
        console.log('Service updateProfile()', data);

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'authorization': this.appService.getToken()
            })
        };

        let req = {
            update: {
                firstName: data.firstName,
                lastName: data.lastName,
                esiid: data.esiid,
                meterid: data.meterid,
                contractendingon: data.contractendingon,
                currentprovider: data.currentprovider
            }
        }
        return this.http.post<any>(this.restURL + "account/profile/update", data, httpOptions);
    }

    goToDashboard(skipConfirmEmailPage: boolean = false, skipOnboardingPage: boolean = false, directlyGoToDefaultDashboard: boolean = false) {
        console.log('goToDashboard params: skipConfirmEmailPage=' + skipConfirmEmailPage + ', skipOnboardingPage=' + skipOnboardingPage);
        console.log('--- goToDashboard() Status:', this.appService.status);
        /*
        if (!this.appService.status.emailConfirmStatus
            && !this.appService.status.esiid
            && !this.appService.status.meter
            && !this.appService.status.profilestat
            && !skipOnboardingPage) {

            this.router.navigate(['/onboarding']);
            return;
        }

        if (!this.appService.status.esiid) {
            this.router.navigate(['/dashboardnesi']);
            return;
        }

        if (!this.appService.status.meter) {
            this.router.navigate(['/dashboardnm']);
            return;
        }

        if (!this.appService.status.emailConfirmStatus && !skipConfirmEmailPage && this.appService.status.pendingauthStatus) {
            this.router.navigate(['/smconfirm']);
            return;
        }

        if (!this.appService.status.profilestat) {
            this.router.navigate(['/dashboardnm']);
            return;
        }

        this.router.navigate(['/dashboard']);
        return;
        */

        if(directlyGoToDefaultDashboard) {
            this.router.navigate(['/dashboard']);
            return;
        }

        if (!this.appService.status.esiid
            && !this.appService.status.meter
            && !this.appService.status.emailConfirmStatus
            && !this.appService.status.profilestat
            && !skipOnboardingPage) {
            //Profile complere page 
            this.router.navigate(['/onboarding']);
            return;
        }

        if (this.appService.status.esiid === false) {
            //No ESI ID page
            this.router.navigate(['/dashboardnesi']);
            return;
        }

        if (this.appService.status.emailConfirmStatus === true 
            && this.appService.status.pendingauthStatus === false 
            && this.appService.status.meter === true
            && this.appService.status.profilestat === true) {
            //user dashboard page
            this.router.navigate(['/dashboard']);
            return;
        }

        if (this.appService.status.emailConfirmStatus === false
            && this.appService.status.pendingauthStatus === true
            && this.appService.status.meter === true
            && skipConfirmEmailPage === false) {
            //SMT Email confirm page
            this.router.navigate(['/smconfirm']);
            return;
        }

        /*
        if (this.appService.status.emailConfirmStatus === true 
            && this.appService.status.pendingauthStatus === false 
            && this.appService.status.meter === true) {
            //user dashboard page
            this.router.navigate(['/dashboard']);
            return;
        }
        */

        if (this.appService.status.profilestat === false) {
            //No Meter Id page
            this.router.navigate(['/dashboardnm']);
            return;
        }

        this.router.navigate(['/dashboard']);
        return;

    }
}


/* 
Flow as discussed with Dhyan
==============
if(!status.esiid && !tstatus.meter && !status.emailConfirmStatus && !status.profilestat)
	Profile complere page 

if (status.esiid == false) 
	No ESI ID page

if (status.emailConfirmStatus==false && status.pendingauthStatus==true && meter==true)
	means -> request submitted in SMT but status pending
	user dashboard page


if (status.emailConfirmStatus==false && status.pendingauthStatus==true && meter==false)
	means -> request not submitted to SMT
	SMT Email confirm page

if (status.emailConfirmStatus==true && status.pendingauthStatus==false && meter==true)
	means -> request active in SMT
	user dashboard page

if (status.profilestat == false) {
	No Meter Id page

otherwise
    user dashboard page
==================
*/