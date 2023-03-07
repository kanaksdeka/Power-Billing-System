import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { AppService } from 'src/app/service/app.service';
import { LoginService } from 'src/app/service/login.service';

@Component({
    selector: 'user-dashboard',
    templateUrl: 'nometerdashboard.component.html',
    styleUrls: ['nometerdashboard.component.scss']
})
export class UserDashboardWithoutMeterComponent implements OnInit {
    test;
    profile;
    status;

    constructor(private router: Router, private appService: AppService, private loginService: LoginService) { }

    ngOnInit() {
        this.appService.openDashboardInput = false;

        this.profile = this.appService.profile;
        this.status = this.appService.status;
    }

    goToCompleteProfile() {
        this.router.navigate(['/onboarding']);
    }

    getCurrentProvider() {
        if (this.profile.currentprovider) {
            return this.loginService.getProviderWithKey(this.profile.currentprovider).company_name;
        }
        else {
            return '';
        }
    }

    dropDownClicked(str) {

    }
}