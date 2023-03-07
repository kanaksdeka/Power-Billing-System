import { Component, Output, EventEmitter } from "@angular/core";
import { AppService } from 'src/app/service/app.service';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';

@Component({
    selector: 'skip-meter',
    templateUrl: 'skipmeter.component.html',
    styleUrls: ['skipmeter.component.scss']
})
export class SkipMeterComponent {

    @Output()
    myEvent = new EventEmitter()

    constructor(private appService: AppService, private loginService: LoginService, private router: Router) { }

    completeLater(opt) {

        this.closeModal();
        this.loginService.goToDashboard(true);

    }

    keyPress(event) {
        if (event.keyCode === 13) {
            this.closeModal();
        }
    }

    closeModal() {
        console.log("Closing Modal")
        this.myEvent.emit('');
    }
}