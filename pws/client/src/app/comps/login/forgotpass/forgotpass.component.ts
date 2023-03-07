import { Component, Output, EventEmitter } from "@angular/core";
import { LoginService } from 'src/app/service/login.service';
import { AppService } from 'src/app/service/app.service';
import { Router } from '@angular/router';

@Component({
    selector: 'forgot-pass',
    templateUrl: 'forgotpass.component.html',
    styleUrls: ['forgotpass.component.scss']
})
export class ForgotPassComponent {
    userName = '';
    password = '';
    error = false;
    errorMsg = "";

    successResponse = false;

    @Output()
    myEvent = new EventEmitter()

    constructor(private loginService: LoginService, private appService: AppService, private router: Router) {

    }

    pass(opj) {
        console.log('Forgot pass');

        if (!this.isValideInput()) {
            this.error = true;
            return;
        }

        this.loginService.forgotPass(this.userName).subscribe(
            (res) => {
                console.log('Forgot pass success', res);
                this.successResponse = true;
            },
            (err) => {
                console.log('Forgot pass error', err);
                if (err.error.errorCode_ === '200-FPWD-001') {
                    this.successResponse = true;
                }
                else {
                    this.successResponse = false;
                    if (err.error.errorDesc_) {
                        this.errorMsg = err.error.errorDesc_;
                    }
                    else {
                        this.errorMsg = 'Internal error !!';
                    }
                }

            }
        )
    }

    isValideInput() {
        if (this.userName.length < 1) {
            return false;
        }
        else {
            return true;
        }
    }
    keyPress(event) {
        if (event.keyCode === 13) {
            this.pass('');
        }
    }

    closeModal() {
        console.log("Closing Modal")
        this.myEvent.emit('');
    }
}