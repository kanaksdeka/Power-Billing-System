import { Component, OnInit } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginPopupComponent } from '../signinPopUp/loginPopup.component';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';

@Component({
    selector: '',
    templateUrl: 'activation.component.html'
})
export class ActivationComponent implements OnInit {
    message = '';
    count = 0;

    constructor(private modalService: NgbModal, private router: Router, private loginService: LoginService) { }
    
    ngOnInit() {
        console.log('ActivationComponent ngOnInit');
    }
    
    ngAfterViewChecked() {
        console.log('###### ActivationComponent ngAfterViewChecked() #######');
        if(this.count === 1) {
            console.log('ActivationComponent count === 1');
            return;
        }
        let uriPath = this.router.url;
        let uriPathParam = uriPath.substring(uriPath.indexOf('?') + 1);
        if(uriPathParam.charAt(uriPathParam.length - 1) == '=') {
            uriPathParam = uriPathParam.substring(0, uriPathParam.length - 1);
        }

        console.log("Path=", uriPath, uriPathParam);
        this.loginService.activationWindoFalf = true;

        this.count = 1;
        this.loginService.activate(uriPathParam).subscribe(
            (res) => {
                console.log('Activation success', res);
                this.openModal('login');
                this.router.navigate(['/']);
            },
            (err) => {
                console.log('Activation error', err);
                //this.message = "User activation failed."
                this.message = err.error.errorDesc_;
            }
        )

    }

    openModal(msg) {
        const modalRef = this.modalService.open(LoginPopupComponent,
            {
                scrollable: true,
                windowClass: 'myCustomModalClass',
                // keyboard: false,
                // backdrop: 'static'
                size: 'lg'
            });

        let data = msg;

        modalRef.componentInstance.fromParent = data;
        modalRef.result.then((result) => {
            console.log(result);
        }, (reason) => {
        });
    }
}