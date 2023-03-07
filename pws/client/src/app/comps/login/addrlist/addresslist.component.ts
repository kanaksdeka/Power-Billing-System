import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';
import { AppService } from 'src/app/service/app.service';

@Component({
  selector: 'app-my-bootstrap-modal',
  templateUrl: './addresslist.component.html',
  styleUrls: ['./addresslist.component.scss']
})
export class AddressListComponent implements OnInit {

  @Input() msg = '';
  @Input() address;
  @Input() zip;
  @Input() premisesType;

  @Output()
  myEvent = new EventEmitter()

  constructor(
    public activeModal: NgbActiveModal,
    private router: Router,
    private loginService: LoginService,
    private appService: AppService
  ) { }

  ngOnInit() {
    console.log('ngOnInit address list [] input', this.address);
    /* Output:
     {prop1: "Some Data", prop2: "From Parent Component", prop3: "This Can be anything"}
    */
  }

  closeModal(sendData) {
    this.activeModal.close(sendData);
    //this.router.navigate(['/home']);
  }

  selectAddress(address) {
    let date = { address: address }
    //this.myEvent.emit(date);
    this.activeModal.close(date);

  }


}