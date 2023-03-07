import { Component } from "@angular/core";
import { LoginService } from 'src/app/service/login.service';
import { AppService } from 'src/app/service/app.service';
import { Router } from '@angular/router';
import { PopupMsgComponent } from '../../landing/popupMsg/popupmsg.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'sign-up',
  templateUrl: 'signup.component.html',
  styleUrls: ['signup.component.scss']
})
export class SignupComponent {

  formData = {
    firstName: "",
    lastName: "",
    email: "",
    confrimEmail: "",
    password: "",
    confirmPassword: "",
    zip: ""
  }

  error = false;

  constructor(private loginService: LoginService, private appService: AppService, private router: Router, private modalService: NgbModal) {

  }
  signUp(obj) {
    console.log('signUp()', obj);

    if (!this.isValidInput()) {
      return;
    }

    this.loginService.signUp(this.formData).subscribe(
      (res) => {
        console.log('signUp success', res);
        this.router.navigate(['/confirmemail']);
      },
      (err) => {
        console.log('signUp error', err);
        this.openModal(err.error.errorDesc_);
      }
    )
  }
  keyPress(event) {
    if (event.keyCode === 13) {
      this.signUp('');
    }
  }

  isValidInput() {
    this.error = true;
    if (!this.formData.firstName || !this.formData.email
      || !this.formData.password || !this.formData.confirmPassword
      || (this.formData.password !== this.formData.confirmPassword)
      || (this.formData.email !== this.formData.confrimEmail)
    ) {
      this.error = true;
      return false;
    }
    else {
      return true;
    }
  }

  openModal(msg) {
    const modalRef = this.modalService.open(PopupMsgComponent,
      {
        scrollable: true,
        windowClass: 'myCustomModalClass',
        // keyboard: false,
        // backdrop: 'static'
      });

    if (msg === '') {
      msg = 'Internal error.'
    }
    let data = msg;

    modalRef.componentInstance.fromParent = data;
    modalRef.result.then((result) => {
      console.log(result);
    }, (reason) => {
    });
  }

}