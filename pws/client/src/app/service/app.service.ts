import { Injectable } from '@angular/core';
import { LoginService } from './login.service';

@Injectable({ providedIn: 'root' })
export class AppService {

    constructor() { }

    private token = '';
    private category = '';
    private id = '';
    // private isMeterIdExist = false;
    //private isEsiidExist = false;
    private _meterId = '';
    private _esiid = '';
    private _addressGBTmp = '';
    private _username = '';
    private _email;
    private _openDashboardInput = false;;
    //private _profilestat;
    private _appList = [];

    private _profile = {
        address: {},
        firstName: '',
        lastName: '',
        fullname: '',
        phoneNumber: '',
        esiid: '',
        meterid: '',
        contractendingon: '',
        currentprovider: ''

    };

    private _address = {
        zipcode: '',
        address: '',
        residenceType: '',
        duration: '',
        state: '',
        apartmentNumber: ''
    };

    private _status = {
        esiid: false,
        meter: false,
        profilestat: false,
        emailConfirmStatus: false,
        pendingauthStatus: false
    };

    public getAppList() {
        return this._appList;
    }
    public appList(value) {
        this._appList.push({value: value, time: new Date()});
    }

    public get status() {
        return this._status;
    }
    public set status(value) {
        this._status = value;
    }

    public get openDashboardInput() {
        return this._openDashboardInput;
    }
    public set openDashboardInput(value) {
        this._openDashboardInput = value;
    }

    public get address() {
        return this._address;
    }
    public set address(value) {
        this._address = value;
    }

    /*
    public get profilestat() {
        return this._profilestat;
    }
    public set profilestat(value) {
        this._profilestat = value;
    }
    */

    public get email() {
        return this._email;
    }
    public set email(value) {
        this._email = value;
    }

    public get profile() {
        return this._profile;
    }
    public set profile(value) {
        this._profile = value;
    }


    public get username() {
        return this._username;
    }
    public set username(value) {
        this._username = value;
    }

    public get addressGBTmp() {
        return this._addressGBTmp;
    }
    public set addressGBTmp(value) {
        this._addressGBTmp = value;
    }

    /*
    public get esiid() {
        return this._esiid;
    }
    public set esiid(value) {
        this.isEsiidExist = true;
        this._esiid = value;
    }

    public get meterId() {
        return this._meterId;
    }
    public set meterId(value) {
        this.isMeterIdExist = true;
        this._meterId = value;
    }
    */

    getIsLoggedIn(): boolean {

        if (this.token === undefined) {
            return false;
        }

        return this.token.length > 10;
    }

    setLoginDetails(req, setToken: boolean = true) {

        if (setToken) {
            this.token = req.token;
        }
        //this.isMeterIdExist = req.status.meter;
        //this.isEsiidExist = req.status.esiid;
        //this._profilestat = req.status.profilestat;

        this._profile = req.profile;
        this._status = req.status;
        if (req.profile.address) {
            this._address = req.profile.address;
        }
        this._email = req.email;
    }

    getToken() {
        return this.token;
    }

    setTokenAfterRefresh(token) {
        this.token = token;
    }

    /*
    getIsMeterIdExist() {
        return this.isMeterIdExist;
    }

    setIsMeterIdExist(isMeterIdExist) {
        this.isMeterIdExist = isMeterIdExist;
    }
    getIsEsiidExist() {
        return this.isEsiidExist;
    }

    setIsEsiidExist(isEsiidExist) {
        return this.isEsiidExist = isEsiidExist;
    }
    */
}