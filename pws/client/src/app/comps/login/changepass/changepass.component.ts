import { Component, Output, EventEmitter } from "@angular/core";
import { LoginService } from 'src/app/service/login.service';
import { AppService } from 'src/app/service/app.service';
import { Router } from '@angular/router';
import { ResultService } from 'src/app/service/result.service';

@Component({
    selector: 'change-pass',
    templateUrl: 'changepass.component.html',
    styleUrls: ['changepass.component.scss']
})
export class ChangePassComponent {
    userName = '';
    password = '';
    error = false;
    errorMsg = "";
    oldPassword = '';
    newPassword = '';

    successResponse = false;

    @Output()
    myEvent = new EventEmitter()

    constructor(private loginService: LoginService, private appService: AppService, private router: Router) {
        this.successResponse = false;;
    }


    isValideInput() {
        if (this.userName.length < 1 || this.password.length < 1) {
            return false;
        }
        else {
            return true;
        }
    }

    changePass(opj) {
        console.log('Change pass.');

        if (!this.isValideInput()) {
            console.log('Validation error - Change pass.');
            this.error = true;
            return;
        }

        let user = this.userName;
        let pass = this.password;

        if (this.loginService.resetToken) {
            this.loginService.resetChangePass(user, pass).subscribe(
                (res) => {
                    console.log('Change pass success', res);
                    this.successResponse = true;
                    //this.closeModal();
                },
                (err) => {
                    console.log('Change pass error', err);
                    if (err.error.errorDesc_) {
                        this.errorMsg = err.error.errorDesc_;
                    }
                    else {
                        this.errorMsg = 'Internal error !!';
                    }
                }
            )
        }
        else {
            this.loginService.changePass(user, pass).subscribe(
                (res) => {
                    console.log('Change pass success', res);
                    this.successResponse = true;
                    //this.closeModal();
                },
                (err) => {
                    console.log('Change pass error', err);
                    if (err.error.errorDesc_) {
                        this.errorMsg = err.error.errorDesc_;
                    }
                    else {
                        this.errorMsg = 'Internal error !!';
                    }
                }
            )
        }
    }

    keyPress(event) {
        if (event.keyCode === 13) {
            this.changePass('');
        }
    }

    closeModal() {
        console.log("Closing Modal")
        //this.myEvent.emit('');
    }
}