import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: "why-energyBuddyr",
    templateUrl: "./whyEnergyBuddy.component.html",
    styleUrls: ["./whyEnergyBuddy.component.scss"]
})

export class WhyEnergyBuddyComponent implements OnInit{

    @ViewChild('feature')
    featureRef: ElementRef;

    constructor(private router:Router) {
        console.log("whyEnergyBuddy Component constructor")
    }

    ngOnInit() {

        let uriPath = this.router.url;
        console.log("Path=" + uriPath);
        
        if(uriPath === '/feature') {
            setTimeout (() => {
                this.featureRef.nativeElement.scrollIntoView();
             }, 100);
        }
        
    }
}