import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ResultService } from 'src/app/service/result.service';
import { ResultWOSUData } from 'src/app/models/resultWOSU.model';
import { FromData } from 'src/app/models/formData.model';
import { Router } from '@angular/router';
import { NgbModal, NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { PopupMsgComponent } from '../popupMsg/popupmsg.component';
import { HelpMsgComponent } from '../helpMsg/helpmsg.component';

@Component({
    selector: "result-wosu",
    templateUrl: "./resultwosu.component.html",
    styleUrls: ["./resultwosu.component.scss"],
    providers: [NgbCarouselConfig] 
})

export class ResultWithoutSignUp implements OnInit {

    @ViewChild('myEl')
    inputMessageRef: ElementRef;
    imageSrc = "";
    zipCode = "...";
    count = 1;

    result:ResultWOSUData[] = [];

    result1:ResultWOSUData[] = [];
    result2:ResultWOSUData[] = [];
    result3:ResultWOSUData[] = [];
    result4:ResultWOSUData[] = [];

    formData:FromData; // = new FromData("123", "", "", false);
    error:boolean = false;

    showIt = false;

    constructor(config: NgbCarouselConfig, private router:Router, private modalService: NgbModal, private resultService:ResultService) {
        console.log("ResultWithoutSignUp Component constructor");
        
        config.interval = 500000;
        config.wrap = false;
        config.keyboard = false;
        config.pauseOnHover = true;
    }

    ngOnInit() {
        console.log("ResultWithoutSignUp ngOnInit()");
        this.formData = this.resultService.getFormData();
        this.goToResultWOSU(null);

        this.imageSrc = this.resultService.getImage1();
    }

    testEvent(obj) {
        
    }

    checkBoxClicked1(opt) {
        console.log("checkBoxClicked1");
        this.formData.typeRecommended = true;
        this.formData.typePromotional = false;
        this.formData.typeRenewable = false;

        this.goToResultWOSU (null);
    }

    checkBoxClicked2(opt) {
        console.log("checkBoxClicked2");
        this.formData.typeRecommended = false;
        this.formData.typePromotional = true;
        this.formData.typeRenewable = false;

        this.goToResultWOSU (null);
    }

    checkBoxClicked3(opt) {
        console.log("checkBoxClicked3");
        this.formData.typeRecommended = false;
        this.formData.typePromotional = false;
        this.formData.typeRenewable = true;

        this.goToResultWOSU (null);
    }

    showTnc() {
        console.log('showHelp');
        this.openHelpModal('tnc');
      }
    showPolicy() {
        console.log('showPolicy');
        this.openHelpModal('policy');
      }

    goToURL(url) {
        window.open(url, '_blank');
    }

    keyPress(event) {
        console.log(event.target.value);
  
        if(event.keyCode === 13 && this.formData.isAgree && this.formData.zipCode.length > 0 && this.formData.meterId.length > 0) {
          this.goToResultWOSU (null);
        }
      }

    goToResultWOSU (obj) {
        //this.openModal("Test message");
        //let uriPath = this.router.url;
       // this.router.navigate(['/resultwosu'])
       //this.showIt = false;
       if(!this.resultService.isValidateForm(this.formData)) {
        this.error = true;
        /*
        this.result = [];

        this.result1 = [];
        this.result2 = [];
        this.result3 = [];
        this.result4 = [];

        this.zipCode = "...";
        */
        return;
      }

      this.zipCode = this.formData.zipCode;
        this.resultService.getRates(this.formData).subscribe (
            (res) => {
              //console.log("Response Data: ", res);

              this.result1 = [];
              this.result2 = [];
              this.result3 = [];
              this.result4 = [];

              let newData:ResultWOSUData[] = [];
              for (let index = 0; index < res.length; index++) { 
                  if(index === 36) {
                      break;
                  }
                let pricingDtl = res[index].pricing_details.substring(18);
                /*
                if(pricingDtl.indexOf("/") > 0) {
                    pricingDtl = pricingDtl.substring(0, pricingDtl.indexOf("/"));
                }
                if(pricingDtl.indexOf(" ") > 0) {
                    pricingDtl = pricingDtl.substring(0, pricingDtl.indexOf(" "));
                }
                if(pricingDtl.indexOf(".") > 0) {
                    pricingDtl = pricingDtl.substring(0, pricingDtl.indexOf("."));
                }
                */
                let val:ResultWOSUData = {rate: res[index].total_charge, imageSrc: res[index].company_logo, site: res[index].website, 
                    planName: res[index].plan_name, pricingDetail: pricingDtl, renewableEnergyId:res[index].renewable_energy_id, term:res[index].term_value, comment: ""};

                if(index >= 0 && index <=8) {
                    this.result1.push(val);
                }
                if(index >= 9 && index <=17) {
                    this.result2.push(val);
                }
                if(index >= 18 && index <=26) {
                    this.result3.push(val);
                }
                if(index >= 26 && index <=34) {
                    this.result4.push(val);
                }

                newData.push(val);
            } 
            this.result = newData;
            this.showIt = true;
            setTimeout (() => {
                this.inputMessageRef.nativeElement.scrollIntoView();
             }, 100);
            console.log("Response data", this.result);
            }, (err) => {
                this.showIt = false;

                this.result = [];

                this.result1 = [];
                this.result2 = [];
                this.result3 = [];
                this.result4 = [];

                //this.zipCode = "...";

                this.openModal(err.error.errorDesc_);
                console.log("Error", err) 
              }
        )
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

    data2 = [
        {
            imageSrc : "http://localhost:4200/assets/images/gexa.png",
            rate: "70$/Month",
            comment: ""
        },
        {
            imageSrc : "http://localhost:4200/assets/images/footer_house.png",
            rate: "75$/Month",
            comment: ""
        },
        {
            imageSrc : "http://localhost:4200/assets/images/gexa.png",
            rate: "60$/Month",
            comment: ""
        },
        {
            imageSrc : "http://localhost:4200/assets/images/gexa.png",
            rate: "60$/Month",
            comment: ""
        }];

    
}