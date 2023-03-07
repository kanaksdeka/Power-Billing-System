import { Component, OnInit } from "@angular/core";
import { LoginService } from 'src/app/service/login.service';
import { Router } from '@angular/router';
import { AppService } from 'src/app/service/app.service';

@Component({
    selector: 'user-dashboard',
    templateUrl: 'nometerdashboard2nd.component.html',
    styleUrls: ['nometerdashboard2nd.component.scss']
})
export class UserDashboardWithoutMeterBillComponent implements OnInit {
    test;
    esiid = '';
    error = false;
    profile;
    zip;
    
    constructor(private loginService: LoginService, private router:Router, private appService: AppService) { }

    ngOnInit() {
        this.appService.openDashboardInput = false;

        this.profile = this.appService.profile;
        this.zip = this.appService.address.zipcode;
    }

    dropDownClicked(str) {
        console.log('dropDownClicked');
    }

    async getLoginDetails(skip) {
        console.log('Sync AppHeaderComponent getLoginDetails()');
        let val = await this.loginService.getLoginDetails(true, skip);
        console.log('Sunc AppHeaderComponent getLoginDetails() completed, val=', val);
    }

    getCurrentProvider() {
        if (this.profile.currentprovider) {
            return this.loginService.getProviderWithKey(this.profile.currentprovider).company_name;
        }
        else {
            return '';
        }
    }

    skipEsiId() {
        this.appService.openDashboardInput = true;
        this.router.navigate(['/dashboard']);
    }

    async submitEsiId() {

        if (!this.esiid) {
            this.error = true;
            return;
        }

        this.loginService.updateEsiId(this.esiid).subscribe(
            (res) => {
                console.log('submitEsiId() success', res);
                this.getLoginDetails(false);
            },
            (err) => {
                console.log('submitEsiId() failed', err);
            }
        )
    }
}