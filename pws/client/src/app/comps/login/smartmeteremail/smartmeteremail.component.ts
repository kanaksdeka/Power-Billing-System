import { Component, OnInit, ElementRef, ViewChild, NgZone } from "@angular/core";
import { templateJitUrl } from '@angular/compiler';
import { MapsAPILoader } from '@agm/core';
import { FormControl } from '@angular/forms';
import { NgbDateStruct, NgbCalendar, NgbModal, NgbDateAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { } from 'googlemaps';
import { AppService } from 'src/app/service/app.service';
import { LoginService } from 'src/app/service/login.service';
import { AddressListComponent } from '../addrlist/addresslist.component';
import { Router } from '@angular/router';
import { CustomAdapter, CustomDateParserFormatter } from 'src/app/service/dateformater.service';
import { LoginPopupComponent } from '../signinPopUp/loginPopup.component';

@Component({
    selector: 'onboarding',
    templateUrl: 'smartmeteremail.component.html',
    styleUrls: ['smartmeteremail.component.scss'],
    providers: [
        { provide: NgbDateAdapter, useClass: CustomAdapter },
        { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
    ]
})
export class SmartMeterEmailComponent implements OnInit {

    formData = { ecid: "" }
    firstName = "";
    lastName = "";
    address = "";
    zip = "";
    premisesType = "";
    terms = false;
    meterId = '';
    esiId = '';
    duration = '';
    provider = '';

    showMeterMsg = false;
    skipMeter = false;

    /* typeahead start */
    @ViewChild('searchEl')
    public searchElimentRef: ElementRef;
    ln = 7.809007;
    lt = 51.678418;

    public searchControl: FormControl;
    /* typeahead end */

    variable = "";
    error = false;

    constructor(
        private mapApiLoader: MapsAPILoader,
        private ngZone: NgZone,
        private calendar: NgbCalendar,
        private appService: AppService,
        private loginService: LoginService,
        private modalService: NgbModal,
        private router: Router) { }

    ngOnInit() {
        this.appService.openDashboardInput = false;

        this.showMeterMsg = false;
    }

    ngOnInit2() {
        /* typeahead start */
        this.searchControl = new FormControl();

        //let southWest = new google.maps.LatLng( 31.522607, -99.255332 );
        //let northEast = new google.maps.LatLng( 31.522607, -99.255332 );
        //let bangaloreBounds = new google.maps.LatLngBounds( southWest, northEast );

        this.mapApiLoader.load().then(() => {
            const autocomplete = new google.maps.places.Autocomplete(this.searchElimentRef.nativeElement, {
                types: [],
                //bounds: bangaloreBounds,
                componentRestrictions: { 'country': 'US', }
            });
            autocomplete.addListener('place_change', () => {
                this.ngZone.run(() => {
                    const place: google.maps.places.PlaceResult = autocomplete.getPlace();
                    if (place.geometry === undefined || place.geometry === null) {
                        return;
                    }

                })
            });
        })
        /* typeahead end */
    }

    model: NgbDateStruct;
    date: { year: number, month: number };

    getEmail() {
        return this.appService.email;
    }

    skipClicked(opt) {
        console.log('skipClicked()');
        this.showMeterMsg = false;
        this.openModal2('skip-meter');
    }

    selectToday() {
        this.model = this.calendar.getToday();
    }

    isLoggedIn() {
        return this.appService.getIsLoggedIn();
    }
    showNameFields() {
        return this.appService.status.esiid;
    }

    showMeterId() {
        this.meterId = this.appService.profile.meterid;
        this.esiId = this.appService.profile.esiid;
        return this.appService.status.meter;
    }


    keyPress(event) {
        if (event.keyCode === 13) {
            this.finishClick('');
        }
    }

    goToDefaultDashboard() {
        console.log('goToDefaultDashboard clicked');
        this.appService.openDashboardInput = true;
        this.loginService.getLoginDetails(true, false, false, true)
    }

    async finishClick(opt) {

        this.loginService.agreementStatus().subscribe(
            (res) => {
                console.log('agreementStatus success response: ', res);

                //if(res.errorCode_ === "404-STAGM-001") {
                //    this.showMeterMsg = true;
                //}

                if (res.errorCode_ === "203-UPR-001") {
                    this.showMeterMsg = true;
                }
                else {
                    this.openModal('', '', '', res.errorDesc_);
                    this.loginService.getLoginDetails(true, false);
                }

            },
            (err) => {
                console.log('Error in agreementStatus: ', err);
                this.openModal('', '', '', 'Internal Error !!');
            }
        );

        //console.log('SmartMeterEmailComponent finishClick()');
        //let val = await this.loginService.getLoginDetails(true, false);
        //console.log('SmartMeterEmailComponent finishClick() completed, val=', val);

        /*
        if (val) {
            this.loginService.goToDashboard(true);
        }
        else {
            this.showMeterMsg = true;
        }
        */

    }

    /*
    getMeterDetails(event) {

        if(!this.validateGetMeterDetailsInput()) {
            this.error = true;
            return;
        }

        let address = this.address;
        address = address.replace(/,/g,'');
        address = address.replace(/#/g,'');
        this.loginService.getMeterDetails(this.zip, address, this.premisesType).subscribe(
            (res) => {
                console.log('getMeterDetails success', res);
                if(res[0].address === '') {
                    this.openModal('', '', '', 'No address found.');
                }
                else if(res[0].address.length === 1) {
                    this.appService.meterId = res.address[0].meter_id;
                }
                else {
                    this.openModal(res[0].address, this.zip, this.premisesType, '');
                }

            },
            (err) => {
                console.log('getMeterDetails failed', err);
                this.openModal('', '', '', err.error.errorDesc_);
            }
        )
    }
    */
    validateGetMeterDetailsInput() {
        if (!this.address || !this.zip || !this.premisesType || !this.terms) {
            return false;
        }
        return true;
    }

    openModal(addressList, zip, premisesType, msg) {
        const modalRef = this.modalService.open(AddressListComponent,
            {
                scrollable: true,
                windowClass: 'myCustomModalClass',
                // keyboard: false,
                // backdrop: 'static'
            });

        modalRef.componentInstance.address = addressList;
        modalRef.componentInstance.zip = zip;
        modalRef.componentInstance.premisesType = premisesType;
        modalRef.componentInstance.msg = msg;
        modalRef.result.then((result) => {
            console.log('Modal', result);
            this.address = this.appService.addressGBTmp;
        }, (reason) => {
        });
    }

    changePassword() {
        this.openModal2('change-pass');
    }

    openModal2(msg) {
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