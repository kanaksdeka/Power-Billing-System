import { Component, OnInit } from "@angular/core"
import { AppService } from 'src/app/service/app.service';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginPopupComponent } from '../login/signinPopUp/loginPopup.component';
import { CookieService } from 'ngx-cookie-service'

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})

export class AppHeaderComponent implements OnInit {

  showNaveBar = false;
  showIt = false;
  profileVal = "";

  constructor(private appService: AppService, private loginService: LoginService, private router: Router, private modalService: NgbModal, private cookieService: CookieService) {
    console.log("Header Component constructor")
  }

  ngOnInit() {
    let uriPath = this.router.url;
    //if(uriPath === '/activate') {
    //  this.openModal('');
    //}

    if (!this.appService.getIsLoggedIn()) {
      let token = this.cookieService.get('ebtoken')
      if (token) {
        this.appService.setTokenAfterRefresh(token);
        this.loginService.getLoginDetails(true, false)
      }
    }

    this.loginService.getProviders();
  }

  async getLoginDetails() {
    console.log('Sync AppHeaderComponent getLoginDetails()');
    let val = await this.loginService.getLoginDetails(true, false);
    console.log('Sunc AppHeaderComponent getLoginDetails() completed, val=', val);

    //this.loginService.goToDashboard(true);

  }

  tougleNavBar() {
    this.showNaveBar = !this.showNaveBar;
  }

  isLoggedIn() {
    return this.appService.getIsLoggedIn();
  }

  logout() {
    this.cookieService.set('ebtoken', '');
    this.router.navigate(['/home']);
    this.loginService.logout();
    
  }

  showLogout(opt) {
    this.showIt = !this.showIt;
  }

  editProfile() {
    //this.router.navigate(['/onboarding']);
    this.router.navigate(['editProfile']);
  }

  myProfile() {
    this.loginService.goToDashboard();
  }

  changePassword() {
    this.openModal('change-pass');
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