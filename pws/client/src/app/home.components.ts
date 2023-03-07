import { Component } from "@angular/core";

@Component({
    //selector: "app-home",
    templateUrl: "./home.component.html"
})
export class HomeComponent {
    mycontent:string = "<b><u>My Sample Content</u></b>"
    count = 0

    incrementCount() {
        this.count++;
    }
}
