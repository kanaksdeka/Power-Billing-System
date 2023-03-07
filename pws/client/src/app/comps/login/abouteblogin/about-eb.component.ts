import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: "about-eb-login",
    templateUrl: "./about-eb.component.html",
    styleUrls: ["./about-eb.component.scss"]
})

export class AboutEBLoginComponent implements OnInit{
    public isCollapsed = true;
    public isCollapsed2 = true;
    public isCollapsed3 = true;
    public isCollapsed4 = true;
    public isCollapsed5 = true;

    @ViewChild('faq')
    faqRef: ElementRef;
    
    constructor(private router:Router) {
        console.log("Find Plan constructor")
    }

    ngOnInit() {

        let uriPath = this.router.url;
        console.log("Path=" + uriPath);
        
        if(uriPath === '/faq') {
            setTimeout (() => {
                this.faqRef.nativeElement.scrollIntoView();
             }, 100);
        }
        
    }
}