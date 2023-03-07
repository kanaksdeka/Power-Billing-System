import { Component, Output, EventEmitter, OnInit } from "@angular/core";
import { LoginService } from 'src/app/service/login.service';
import { AppService } from 'src/app/service/app.service';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service'

@Component({
    selector: 'sign-in',
    templateUrl: 'signin.component.html',
    styleUrls: ['signin.component.scss']
})
export class SigninComponent implements OnInit {
    userName = '';
    password = '';
    error = false;
    errorMsg = "";
    infoMsg = "";
    isLoginDisabled = false;

    showForgotPass = false;

    @Output()
    myEvent = new EventEmitter()

    constructor(private loginService: LoginService, private appService: AppService, private router: Router, public activeModal: NgbActiveModal, private cookiService: CookieService) {

    }

    ngOnInit() {
        //let uriPath = this.router.url;
        //console.log("Path=" + uriPath);
        if (this.loginService.activationWindoFalf) {
            this.loginService.activationWindoFalf = false;
            this.infoMsg = "User successfully activated. Please login."
        }
    }

    signIn(opj) {
        console.log('Sign in.');

        if (!this.isValideInput()) {
            this.error = true;
            return;
        }

        this.isLoginDisabled = true;
        this.infoMsg = "Logging in please wait ...";
        this.errorMsg = "";

        this.appService.appList(this.userName);

        this.loginService.login(this.userName, this.password).subscribe(
            (res) => {
                console.log('Sign in success', res);
                if (res.token) {

                    this.appService.email = this.userName;

                    this.appService.setLoginDetails(res);
                    this.cookiService.set('ebtoken', res.token);
                    this.activeModal.close();

                    this.isLoginDisabled = false;
                    this.infoMsg = '';

                    this.loginService.goToDashboard();

                }
                else {
                    console.log('Sign in error, No token found');
                    this.errorMsg = 'Internal Error';
                    this.isLoginDisabled = false;
                    this.infoMsg = '';
                }
            },
            (err) => {
                console.log('Sign in error', err);

                if (err.error.errorDesc_) {
                    this.errorMsg = err.error.errorDesc_;
                }
                else {
                    this.errorMsg = 'Internal Error';
                }

                this.isLoginDisabled = false;
                this.infoMsg = '';
            }
        )
    }

    isValideInput() {
        if (this.userName.length < 1 || this.password.length < 1) {
            return false;
        }
        else {
            return true;
        }
    }
    keyPress(event) {
        if (event.keyCode === 13) {
            this.signIn('');
        }
    }

    forgotPassword() {
        console.log('forgotPassword');
        this.showForgotPass = true;
    }

    closeModal() {
        console.log("Closing Modal")
        //this.myEvent.emit('');
        this.router.navigate(['/home']);
    }
}