import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: "why-need",
    templateUrl: "./why-need.component.html",
    styleUrls: ["./why-need.component.scss"]
})

export class WhyNeedEBComponent implements OnInit{

    @ViewChild('reviews')
    reviewsRef: ElementRef;

    @ViewChild('videoEl')
    videoElRef: ElementRef;
    
    constructor(private router:Router) {
        console.log("Find Plan constructor")
    }

    ngOnInit() {

        let uriPath = this.router.url;
        console.log("Path=" + uriPath);
        
        if(uriPath === '/reviews') {
            setTimeout (() => {
                this.reviewsRef.nativeElement.scrollIntoView();
             }, 100);
        }
        
    }

    play = false;
    showVideoImage = true;
    playVideo(event) {
        this.showVideoImage = false;
        this.play = !this.play;
        if(this.play) {
            //event.toElement.play()
            this.videoElRef.nativeElement.play();
        }
        else {
            //event.toElement.pause()
            this.videoElRef.nativeElement.pause();
        }
     }
}