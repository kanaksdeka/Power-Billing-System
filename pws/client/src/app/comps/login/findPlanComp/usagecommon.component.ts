import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResultService } from 'src/app/service/result.service';
import { FromData } from 'src/app/models/formData.model';
import { PopupMsgComponent } from '../../landing/popupMsg/popupmsg.component';
import { HelpMsgComponent } from '../../landing/helpMsg/helpmsg.component';
import { AppService } from 'src/app/service/app.service';

@Component({
    selector: "find-plan-shared",
    templateUrl: "./usagecommon.component.html",
    styleUrls: ["./usagecommon.component.scss"]
})

export class FindPlanSharedComponent implements OnInit{

    form:FromData; //= new FromData("123", "", "", false);
    error:boolean = false;
    imageSrc = "";
    count = 1;

    idSignUpActive = false;
    isConfirmActive = false;
    isCompleteProfileActive = false;

    constructor(private router:Router, private modalService: NgbModal, private resultService:ResultService, private appService: AppService) {
        console.log("Find Plan constructor")
    }

    ngOnInit() {
        this.appService.openDashboardInput = false;

        this.form = this.resultService.getFormData();
        this.imageSrc = this.resultService.getImage1();

        let uriPath = this.router.url;
        console.log("Path=" + uriPath);
        if(uriPath === '/signup') {
          this.idSignUpActive = true;
          this.isConfirmActive = false;
          this.isCompleteProfileActive = false;
        }
        else if(uriPath === '/confirmemail') {
          this.idSignUpActive = true;
          this.isConfirmActive = true;
          this.isCompleteProfileActive = false;
        }
        else if(uriPath === '/onboarding') {
          this.idSignUpActive = true;
          this.isConfirmActive = true;
          this.isCompleteProfileActive = true;
        }
        else if(uriPath === '/smconfirm') {
          this.idSignUpActive = true;
          this.isConfirmActive = true;
          this.isCompleteProfileActive = true;
        }

      }

      formatLabel(value: number) {
        return value + ' kWh';
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

      if(event.keyCode === 13) { //} && this.form.isAgree && this.form.zipCode.length > 0 && this.form.meterId.length > 0) {
        this.goToResultWOSU (null);
      }
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

      signUp() {
        this.router.navigate(['/signup']);
      }

      onboarding() {
        this.router.navigate(['/onboarding']);
      }

      confirmemail() {
        this.router.navigate(['/confirmemail']);
      }
}