import { Component, Output, EventEmitter } from "@angular/core";
import { LoginService } from 'src/app/service/login.service';
import { AppService } from 'src/app/service/app.service';
import { Router } from '@angular/router';
import { ResultService } from 'src/app/service/result.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'what-you-pay',
    templateUrl: 'whatyoupay.component.html',
    styleUrls: ['whatyoupay.component.scss']
})
export class WhatYouPayComponent {
    userName = '';
    password = '';
    error = false;
    errorMsg = "";

    @Output()
    myEvent = new EventEmitter()

    constructor(private loginService: ResultService, private appService: AppService, private router:Router, public activeModal: NgbActiveModal) {

    }

    signIn(opj) {
        console.log('Sign in.');

        if(!this.isValideInput()) {
            this.error = true;
            return;
        }

        this.loginService.getChartDataWithMeterId(this.userName, this.password).subscribe(
            (res) => {
                console.log('getChartDataWithMeterId() success', res);
                this.closeModal('');
                
            },
            (err) => {
                console.log('getChartDataWithMeterId() error', err);
                this.errorMsg = err.error.errorDesc_;
            }
        )
    }

    isValideInput() {
        if(this.userName.length < 1 || this.password.length < 1) {
            return false;
        }
        else {
            return true;
        }
    }
    keyPress(obj) {
        console.log('keyPress')
    }

    simpleCloseModal() {
        console.log("Simple Closing Modal")
        this.activeModal.close();
    }

    closeModal(opt) {
        console.log("Closing Modal", opt)

        if(!this.isValideInput()) {
            this.error = true;
            return;
        }

        let date = {usage: this.userName, month: this.password}
        //this.myEvent.emit(date);
        this.activeModal.close(date);
    }
}