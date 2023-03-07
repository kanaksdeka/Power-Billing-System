import { Component, OnInit } from "@angular/core";
import { AppService } from 'src/app/service/app.service';

@Component({
    selector: 'confirm-email',
    templateUrl: 'confirmEmail.component.html'
})
export class ConfirmEmailComponent implements OnInit{

    error = false;
    email = '';

    constructor(private appService: AppService) {}
    
    ngOnInit() {
        this.appService.openDashboardInput = false;
    }
}