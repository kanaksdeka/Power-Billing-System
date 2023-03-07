import {Component} from "@angular/core"
import { HelpMsgComponent } from '../helpMsg/helpmsg.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "app-footer",
    templateUrl: "./footer.component.html",
    styleUrls: ["./footer.component.scss"]
})

export class AppFooterComponent{
    constructor(private modalService: NgbModal) {
        console.log("Header Component constructor")
    }

    scrollTop() {
        window.scroll(0,0);
    }

    showTnc() {
        console.log('showTnc');
      this.openHelpModal('tnc');
    }

    showPolicy() {
        console.log('showTnc');
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