import { Component, OnInit, ElementRef, ViewChild, NgZone, AfterViewInit } from "@angular/core";
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
import { merge, Subject, Observable } from 'rxjs';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

@Component({
    selector: 'onboarding',
    templateUrl: 'editProfile.component.html',
    styleUrls: ['editProfile.component.scss'],
    providers: [
        { provide: NgbDateAdapter, useClass: CustomAdapter },
        { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
    ]
})
export class EditProfileComponent implements OnInit, AfterViewInit {

    formData = { ecid: "" }
    firstName = "";
    lastName = "";
    address = "";
    zip = "";
    premisesType = "residential";
    terms = false;
    meterId = '';
    esiId = '';

    apartmentNumber = '';
    duration = { code: '', value: 'Select a value' };
    durationList = []
    durationMap = {};

    provider = { company_id: '', company_name: "Select a value" };
    @ViewChild('providerInstance', { static: true }) instance: NgbTypeahead;
    focus$ = new Subject<string>();
    click$ = new Subject<string>();

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
        private router: Router) {

    }

    ngAfterViewInit() {
        console.log('Edit profile ngAfterViewInit()');
        this.initDuration();

        setTimeout(() => {
            this.initSetFormData();
        }, 200);

    }

    initDuration() {
        this.durationList.push({ code: '', value: 'Select a value' });
        this.durationMap[''] = { code: '', value: 'Select a value' };

        this.durationList.push({ code: '1', value: '1 Month' });
        this.durationMap['1'] = { code: '1', value: '1 Month' };

        this.durationList.push({ code: '2', value: '2 Month' });
        this.durationMap['2'] = { code: '2', value: '2 Month' };

        this.durationList.push({ code: '3', value: '3 Month' });
        this.durationMap['3'] = { code: '3', value: '3 Month' };

        this.durationList.push({ code: '4', value: '4 Month' });
        this.durationMap['4'] = { code: '4', value: '4 Month' };

        this.durationList.push({ code: '5', value: '5 Month' });
        this.durationMap['5'] =

            this.durationList.push({ code: '6', value: '6 Month' });
        this.durationMap['6'] = { code: '6', value: '6 Month' }

        this.durationList.push({ code: '7', value: 'More than 6 Month' });
        this.durationMap['7'] = { code: '7', value: 'More than 6 Month' };

        this.durationList.push({ code: '12', value: 'More than 12 Month' });
        this.durationMap['12'] = { code: '12', value: 'More than 12 Month' };
    }

    ngOnInit() {

        this.selectToday();

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
            autocomplete.addListener('place_changed', () => {
                this.ngZone.run(() => {
                    const place: google.maps.places.PlaceResult = autocomplete.getPlace();
                    if (place.geometry === undefined || place.geometry === null) {
                        return;
                    }

                     //////////////////////
                     if (place.address_components) {
                        let address2 = [
                            (place.address_components[0] && place.address_components[0].long_name || ' *** '),
                            (place.address_components[1] && place.address_components[1].long_name || ''),
                            (place.address_components[2] && place.address_components[2].long_name || '')
                        ].join(' ');
                        console.log('long  name: ', address2)
                    }
                    var address = '';
                    if (place.address_components) {
                        address = [
                            (place.address_components[0] && place.address_components[0].short_name || ' *** '),
                            (place.address_components[1] && place.address_components[1].short_name || ''),
                            (place.address_components[2] && place.address_components[2].short_name || '')
                        ].join(' ');
                        console.log('short name: ', address)
                    }
                    //////////////////////

                    this.searchElimentRef.nativeElement.value = address;

                })
            });
        })
        /* typeahead end */
    }

    model: NgbDateStruct;
    date: { year: number, month: number };


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

    async getLoginDetails(goToDashboard: boolean) {
        console.log('Sync AppHeaderComponent getLoginDetails()');
        let val = await this.loginService.getLoginDetails(goToDashboard, false);
        console.log('Sunc AppHeaderComponent getLoginDetails() completed, val=', val);

        //this.loginService.goToDashboard(true);

    }

    selectedDurationDropDown(item) {
        console.log('selected Duration from DropDown: ', item);
        this.duration = item;
    }

    updateProfile() {

        if (!this.validateGetMeterDetailsInput()) {
            return;
        }

        let addressVal = this.searchElimentRef.nativeElement.value;
        addressVal = addressVal.replace(/,/g, '');
        addressVal = addressVal.replace(/#/g, '');
        addressVal = addressVal.replace(/-/g, '');

        if (this.appService.address.address !== addressVal
            || this.appService.profile.meterid !== this.meterId) {

            this.onboard('');
            this.getLoginDetails(false);
        }
        else {
            this.completeProfile('');
            this.getLoginDetails(false);
        }


    }

    formatDate(str: string) {
        if (!str) {
            return '';
        }

        let day = str.substring(0, str.indexOf('-'));
        let month = str.substring(str.indexOf('-') + 1, str.lastIndexOf('-'));
        let year = str.substring(str.lastIndexOf('-') + 1);

        return month + '-' + day + '-' + year;
    }

    prepareRequestJson() {

        let selectedDate = '';
        if (this.model.year) {
            selectedDate = this.model.month + '-' + this.model.day + '-' + this.model.year + ' 00:00:00';
        }
        else {
            selectedDate = this.formatDate(this.model + '') + ' 00:00:00';
        }

        let req = {
            update: {
                firstname: this.firstName,
                lastname: this.lastName,
                email: this.appService.email,
                esiid: '', //this.esiId,
                meterid: this.meterId,
                contractendingon: selectedDate,
                currentprovider: this.provider.company_id,
                apartmentNumber: this.apartmentNumber,
                zipcode: this.zip
            }
        }

        if (this.appService.profile.firstName === this.firstName) {
            req.update.firstname = '';
        }

        if (this.appService.profile.lastName === this.lastName) {
            req.update.lastname = '';
        }

        if (this.appService.profile.meterid === this.meterId) {
            req.update.meterid = '';
        }

        if (this.appService.profile.currentprovider + '' === this.provider.company_id + '') {
            req.update.currentprovider = '';
        }

        if (this.appService.address.apartmentNumber === this.apartmentNumber) {
            req.update.apartmentNumber = '';
        }

        if (this.appService.address.zipcode === this.zip) {
            req.update.zipcode = '';
        }

        if (this.appService.profile.contractendingon === selectedDate) {
            req.update.contractendingon = '';
        }

        return req;
    }

    completeProfile(opt) {
        let req = this.prepareRequestJson();

        this.loginService.updateProfile(req).subscribe(
            (res) => {
                console.log('updateProfile() call success: ', res);
                this.openModal('', '', '', 'Profile successfully updated !!');
            },
            (err) => {
                console.log('updateProfile() call error: ', err);
                let error = err.error.errorDesc_;
                if (!error) {
                    error = 'Internal error !!'
                }
                this.openModal('', '', '', error);
            }
        )

    }

    onboard(obj) {
        console.log('onboard');
        //this.getMeterDetails('');

        let selectedDate = '';
        if (this.model.year) {
            selectedDate = this.model.month + '-' + this.model.day + '-' + this.model.year + ' 00:00:00';
        }
        else {
            selectedDate = this.formatDate(this.model + '') + ' 00:00:00';
        }

        let addressVal = this.searchElimentRef.nativeElement.value;
        addressVal = addressVal.replace(/,/g, '');
        addressVal = addressVal.replace(/#/g, '');
        addressVal = addressVal.replace(/-/g, '');

        let req = {
            zipcode: this.zip,
            address: addressVal,
            premise_type: this.premisesType,
            email: '',
            duration: this.duration.code,
            meternumber: this.meterId,
            puctrornumber: this.provider.company_id,
            contractendingon: selectedDate,
            apartmentNumber: this.apartmentNumber,
            iseditcalled: true
        }

        let req2 = {
            "zipcode": "77407",
            "address": "8606 brookdale park ln",
            "premise_type": "residential",
            "email": "dhyan_p@yahoo.com",
            "duration": "12",
            "meternumber": "I92309099",
            "puctrornumber": 10040,
            "contractendingon": "2020-07-16 14:12:28"
        }

        let req4 = {
            "zipcode": "77407",
            "address": "8606",
            "premise_type": "residential",
            "email": "dhyan_p@yahoo.com",
            "duration": "12",
            "meternumber": "I92309099",
            "puctrornumber": 10040,
            "contractendingon": "2020-07-16 14:12:28"
        }

        this.loginService.saveOnboardingDetails(req).subscribe(
            (res) => {
                console.log('onboard success', res);

                if (res.address && res.address.length > 0) {
                    this.openModal(res.address, this.zip, this.premisesType, '');
                    return;
                }

                //this.loginService.getLoginDetails(false, false);  //Already call in the parent method
                //this.router.navigate(['/dashboard']);
                this.openModal('', '', '', 'Profile successfully updated !!');
            },
            (err) => {
                console.log('onboard failed', err);
                let error = err.error.errorDesc_;
                if (!error) {
                    error = 'Internal error !!'
                }
                this.openModal('', '', '', error);
            }
        );

    }

    skip(obj) {
        console.log('skip');
        this.router.navigate(['/dashboardnm']);
    }

    keyPress(event) {
        if (event.keyCode === 13) {
            this.updateProfile();
        }
    }

    /*
    getMeterDetails(event) {
 
        if(!this.validateGetMeterDetailsInput()) {
            this.error = true;
            return;
        }
 
        let address = this.searchElimentRef.nativeElement.value;
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
                let error = err.error.errorDesc_;
                if(!error) {
                    error = 'Internal error !!'
                }
                this.openModal('', '', '', error);
            }
        )
    }
    */

    validateGetMeterDetailsInput() {
        if (!this.address || !this.zip || !this.terms || !this.provider.company_id || !this.duration.value) {
            this.error = true;
            return false;
        }
        return true;
    }

    selectedProviderDropDown(item) {
        console.log('selected Provider from DropDown: ', item);
        this.provider = item;
    }

    findProvider(provider) {

    }

    formatter = (result: any) => result.company_name;
    inputFormatter = (result: any) => result.company_name;

    providerSearch = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
        const inputFocus$ = this.focus$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.loginService.providersMap
                : this.loginService.providersMap.filter(v => v.company_name.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );
    }

    initSetFormData() {

        this.firstName = this.appService.profile.firstName;
        this.lastName = this.appService.profile.lastName;
        this.esiId = this.appService.profile.esiid;
        this.meterId = this.appService.profile.meterid;
        this.searchElimentRef.nativeElement.value = this.appService.address.address;
        this.address = this.appService.address.address;
        //this.model = new Date(this.appService.profile.contractendingon).getTime();
        this.duration = this.durationMap[this.appService.address.duration + ''];
        this.provider = this.loginService.getProviderWithKey(this.appService.profile.currentprovider);
        this.zip = this.appService.address.zipcode;
        this.apartmentNumber = this.appService.address.apartmentNumber;

        if (this.appService.profile.contractendingon) {
            let dt = new Date(this.appService.profile.contractendingon);
            this.model = { day: dt.getUTCDate(), month: dt.getUTCMonth() + 1, year: dt.getUTCFullYear() };
            //this.date = { month: dt.getUTCMonth() + 1, year: dt.getUTCFullYear() };
        }
    }

    getProvider() {
        return this.loginService.providersMap;
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
            console.log('Modal closed callback: ', result);
            if (result.address) {
                this.address = result.address;
                this.searchElimentRef.nativeElement.value = result.address;
                this.onboard('');
            }

        }, (reason) => {
            console.log('Modal closed callback Error: ', reason);
        });
    }
}