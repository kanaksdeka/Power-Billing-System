import { Component, OnInit } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginPopupComponent } from '../signinPopUp/loginPopup.component';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';

@Component({
    selector: 'resetpass',
    templateUrl: 'resetpass.component.html'
})
export class ResetPassComponent implements OnInit {
    message = 'Kanak';
    count = 0;

    constructor(private modalService: NgbModal, private router: Router, private loginService: LoginService) { }
    
    ngOnInit() {
        console.log('resetpass ngOnInit');
    }
    
    ngAfterViewChecked() {
        console.log('###### resetpass ngAfterViewChecked() #######');

        if(this.count > 0) {
            console.log('ActivationComponent count === 1');
            return;
        }
        this.count = 1;

        let uriPath = this.router.url;
        let uriPathParam = uriPath.substring(uriPath.indexOf('en=') + 3);
        
        if(uriPathParam.indexOf('%3D') > 0) {
            uriPathParam = uriPathParam.substring(0, uriPathParam.indexOf('%3D')) + '==';
        }

        console.log("Path=", uriPath, uriPathParam);
        this.loginService.resetToken = uriPathParam;

        this.router.navigate(['/home']);

        setTimeout (() => {
            this.openModal('change-pass');
         }, 100);
        

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