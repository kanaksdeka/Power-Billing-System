import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { PopupMsgComponent } from '../popupMsg/popupmsg.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResultService } from 'src/app/service/result.service';
import { FromData } from 'src/app/models/formData.model';
import { HelpMsgComponent } from '../helpMsg/helpmsg.component';

@Component({
    selector: "find-plan",
    templateUrl: "./find-plan.component.html",
    styleUrls: ["./find-plan.component.scss"],
    encapsulation: ViewEncapsulation.None,
})

export class FindPlanComponent implements OnInit{

    form:FromData; //= new FromData("123", "", "", false);
    error:boolean = false;
    imageSrc = "";
    count = 1;
    constructor(private router:Router, private modalService: NgbModal, private resultService:ResultService) {
        console.log("Find Plan constructor")
    }

    ngOnInit() {
        this.form = this.resultService.getFormData();
        this.imageSrc = this.resultService.getImage1();

        //let uriPath = this.router.url;
        //console.log("Path=" + uriPath);
      }

    showHelp() {
      console.log('showHelp');
      this.openHelpModal('tnc');
    }
    showPolicy() {
      console.log('showPolicy');
      this.openHelpModal('policy');
    }

    keyPress(event) {
      console.log(event.target.value);

      if (event.keyCode === 13) { //&& this.form.isAgree && this.form.zipCode.length > 0 && this.form.meterId.length > 0) {
        this.goToResultWOSU (null);
      }
    }

    formatLabel(value: number) {
      return value + ' kWh';
    }

    goToResultWOSU (obj) {

        if(!this.resultService.isValidateForm(this.form)) {
          this.error = true;
          //this.openModal("Usage and zip code are mandatory field");
          return;
        }

        this.resultService.setFormData(this.form);
        this.router.navigate(['/results']);


        /*
        let uriPath = this.router.url;
        console.log("Path=" + uriPath);
        
        if(uriPath === '/results') {
            this.resultService.setFormData(this.form);
        }
        else {
            this.resultService.setFormData(this.form);
            this.router.navigate(['/results'])
        }
        */
    }

    
    openModal(msg) {
        const modalRef = this.modalService.open(PopupMsgComponent,
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