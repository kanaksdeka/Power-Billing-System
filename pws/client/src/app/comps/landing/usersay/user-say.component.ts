import { Component, OnInit } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
    selector: "user-say",
    templateUrl: "./user-say.component.html",
    styleUrls: ["./user-say.component.scss"],
    providers: [NgbCarouselConfig] 
})

export class UserSayComponent implements OnInit{
    images = [700, 533, 807, 124].map((n) => `./assets/images/video_img.png`);
    constructor(config: NgbCarouselConfig, private router:Router) {
        console.log("user-say Component constructor");
        
        config.interval = 30000;
        config.wrap = true;
        config.keyboard = false;
        config.pauseOnHover = false;
    }

    ngOnInit() {
        console.log("UserSay Component on inti()");
    }
}