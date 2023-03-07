import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { FindPlanComponent } from './comps/landing/findPlanComp/find-plan.component';
import { AppHeaderComponent } from './comps/header/app-header.component';
import { HomeComponent } from './home.components';
import { WhyEnergyBuddyComponent } from './comps/landing/whyeb/whyEnergyBuddy.component';
import { WhyNeedEBComponent } from './comps/landing/ebneed/why-need.component';
import { UserSayComponent } from './comps/landing/usersay/user-say.component';
import { AppFooterComponent } from './comps/landing/footer/footer.component';
import { ResultWithoutSignUp } from './comps/landing/resultsWithoutSignUp/resultwosu.component';
import { PopupMsgComponent } from './comps/landing/popupMsg/popupmsg.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ResultService } from './service/result.service';
import { HttpClientModule } from '@angular/common/http';
import { HelpMsgComponent } from './comps/landing/helpMsg/helpmsg.component';
import { LoginModule } from './comps/login/login.module';
import { AppService } from './service/app.service';
import { Constants } from './service/constants';
import { DummyData } from './service/dummydata.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { ActivationComponent } from './comps/login/activation/activation.component';
import { SharedModule } from './comps/shared/shared.module';

@NgModule({
  declarations: [
    AppComponent, 
    FindPlanComponent,
    AppHeaderComponent,
    HomeComponent,
    WhyEnergyBuddyComponent,
    WhyNeedEBComponent,
    UserSayComponent,
    AppFooterComponent,
    ResultWithoutSignUp,
    PopupMsgComponent,
    HelpMsgComponent,
    ActivationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    LoginModule,
    BrowserAnimationsModule,
    MatSliderModule,
    SharedModule
  ],
  providers: [
    ResultService,
    AppService,
    DummyData,
    Constants
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
