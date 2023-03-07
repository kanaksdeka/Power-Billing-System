import { Component } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelpMsgComponent } from '../../landing/helpMsg/helpmsg.component';

@Component({
    selector: 'login-footer',
    templateUrl: 'loginfooter.component.html'
})
export class LoginFooterComponent {

    constructor(private modalService: NgbModal) { }

    showTnc() {
        console.log('showHelp');
        this.openHelpModal('tnc');
    }
    showPolicy() {
        console.log('showPolicy');
        this.openHelpModal('policy');
    }

    openHelpModal(msg) {
        const modalRef = this.modalService.open(HelpMsgComponent,
            {
                scrollable: true,
                windowClass: 'myCustomModalClass',
                // keyboard: false,
                // backdrop: 'static'
            });

        let data = msg;

        modalRef.componentInstance.fromParent = data;
        modalRef.result.then((result) => {
            console.log(result);
        }, (reason) => {
        });
    }
}