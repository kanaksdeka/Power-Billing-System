import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { AboutEBComponent } from '../landing/abouteb/about-eb.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [
        AboutEBComponent
    ],
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        CommonModule,
        HttpClientModule,
    ],
    exports: [
        AboutEBComponent
    ]
})
export class SharedModule { }