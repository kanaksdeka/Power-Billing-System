import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { FromData } from '../models/formData.model';
import { ResultWOSUData } from '../models/resultWOSU.model';
import { Constants } from './constants';
import { DummyData } from './dummydata.service';
import { of } from 'rxjs';

@Injectable({providedIn: 'root'})
export class ResultService {

    private restURL = "";
    private _profileLo = false;

    form:FromData = new FromData('1400', "", "", true, false, false, false);
    test: boolean = false;

    constructor(private http:HttpClient, constants: Constants, private dummyData: DummyData) {
        this.restURL = constants.restURL;
    }

    setFormData = (dataf:FromData) => {
        this.form = dataf;
        
        if(this.form.meterId === '1234') {
            this.test = true;
        }
    }

    getFormData() : FromData {
        return this.form;
    }

    isValidateForm(fData:FromData):boolean {
        let meter = fData.meterId + '';
        if(meter.trim().length === 0)
            return false;
        
        if(fData.zipCode.trim().length === 0)
            return false;

        if(!fData.isAgree)
            return false;

        return true;
    }

    public get profileLo() {
        return this._profileLo;
    }
    public set profileLo(value) {
        this._profileLo = value;
    }

    resetFormData() {
        this.form = new FromData("", "", "", true, false, false, false);
    }

    getResult():ResultWOSUData[] {
        let resultArray:ResultWOSUData[] = [];

        let coutn = 5;
        if(this.test) {
            coutn = 2;
        }
        

        for (let index = 0; index < coutn; index++) {
            let result:ResultWOSUData = new ResultWOSUData("$"+("75" + index) + "/month", "http://localhost:4200/assets/images/gexa.png", "", "", "", "", "", "");
            resultArray.push(result);
        }
        
        return resultArray;
    }

    getRates(reqData:FromData) {
        /*
        let req2 = {
            "zip": "77573",
            "email": "dhyan_p@yahoo.com",
            "usage": "451"
            };
        */
        let type = "";
        if(reqData.typeRecommended) {
            type = 'd'
        }
        else if(reqData.typePromotional) {
            type = 'p'
        }
        else if(reqData.typeRenewable) {
            type = 'r'
        }
        else {
            return;
        }

        let req = {
                "zip": reqData.zipCode,
                "email": "a@a.aaa",
                "usage": reqData.meterId,
                "type": type
                };
        
        console.log("payload", req);
        return this.http.post<any>(this.restURL + "calculate/rate", req);
    }

    getImage1() {
        //return this.restURL + "assets/images/find_plan.svg";
        return "/assets/images/find_plan.svg"
    }

    getChartData(usage, month) {
        let req = {
            "usage": usage,
            "month": month
            };

        console.log("getChartData http call payload: ", req);
        //return of(this.dummyData.chartData).pipe();
        return this.http.post<any>(this.restURL + "account/usage/scalar", req);
    }

    getChartDataWithMeterId(userName, password) {
        let req = {
            "password": password,
            "email": userName
        };

        return null;
    }
}