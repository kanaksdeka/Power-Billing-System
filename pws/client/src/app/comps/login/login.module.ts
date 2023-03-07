import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { BrowserModule } from '@angular/platform-browser';
import { AgmCoreModule} from '@agm/core'
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SigninComponent } from './signin/signin.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginService } from 'src/app/service/login.service';
import { UserDashboardComponent } from './userDashboard/userdashboard.component';
import { ForgotPassComponent } from './forgotpass/forgotpass.component';
import { ChangePassComponent } from './changepass/changepass.component';
import { AddressListComponent } from './addrlist/addresslist.component';
import { UserDashboardWithoutMeterComponent } from './userDsBrdNoMeter/nometerdashboard.component';
import { LoginPopupComponent } from './signinPopUp/loginPopup.component';
import { FindPlanSharedComponent } from './findPlanComp/usagecommon.component';
import { LoginFooterComponent } from './footer/loginfooter.component';
import { ConfirmEmailComponent } from './confirmEmail/confirmEmail.component';
import { MatSliderModule } from '@angular/material/slider';
import { ChartsModule} from 'ng2-charts'
import { ActivationComponent } from './activation/activation.component';
import { SharedModule } from '../shared/shared.module';
import { AboutEBLoginComponent } from './abouteblogin/about-eb.component';
import { UserDashboardWithoutMeterBillComponent } from './userDsBrdNoMeter2nd/nometerdashboard2nd.component';
import { SmartMeterEmailComponent } from './smartmeteremail/smartmeteremail.component';
import { SkipMeterComponent } from './skipMeter/skipmeter.component';
import { WhatYouPayComponent } from './whatyoupay/whatyoupay.component';
import { Test } from './test/test.component';
import { EditProfileComponent } from './editProfile/editProfile.component';
import { TestAddress } from './test2/testAddress.component';
import { ResetPassComponent } from './resetpass/resetpass.component';
import { Test3Component } from './test3/test3.component';
import { LoginPopupMsgComponent } from './popupMsg/popupmsglogin.component';
//import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';

let loginRoutes:Routes = [
    {path:"signin", component: SigninComponent},
    {path:"signup", component: SignupComponent},
    {path:"onboarding", component: OnboardingComponent},
    {path:"dashboard", component: UserDashboardComponent}, 
    {path:"dashboardnopfl", component: UserDashboardComponent},
    {path:"forgotpass", component: ForgotPassComponent},
    {path:"changepass", component: ChangePassComponent},
    {path:"dashboardnm", component: UserDashboardWithoutMeterComponent},
    {path:"confirmemail", component: ConfirmEmailComponent},
    {path:"activate", component: ActivationComponent},
    //{path:"dashboardlo", component: UserDashboardWithoutMeterloComponent},
    {path:"dashboardnesi", component: UserDashboardWithoutMeterBillComponent},
    {path:"smconfirm", component: SmartMeterEmailComponent},
    {path:"editProfile", component: EditProfileComponent},
    {path:"testg", component: Test},
    {path:"testa", component: TestAddress},
    {path:"testtype", component: Test3Component},
    {path: "account/reset", component: ResetPassComponent}
];

@NgModule({
    declarations: [
        SignupComponent, 
        SigninComponent, 
        OnboardingComponent,
        UserDashboardComponent,
        ForgotPassComponent,
        ChangePassComponent,
        AddressListComponent,
        UserDashboardWithoutMeterComponent,
        LoginPopupComponent,
        FindPlanSharedComponent,
        LoginFooterComponent,
        ConfirmEmailComponent,
        AboutEBLoginComponent,
        UserDashboardWithoutMeterBillComponent,
        EditProfileComponent,
        //UserDashboardWithoutMeterloComponent,
        SmartMeterEmailComponent,
        SkipMeterComponent,
        WhatYouPayComponent,
        Test,
        Test3Component,
        ResetPassComponent,
        LoginPopupMsgComponent,
        TestAddress
    ],
    imports: [RouterModule.forChild(loginRoutes), 
        BrowserModule, 
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        CommonModule,
        MatSliderModule,
        ChartsModule,
        SharedModule,
        //MatGoogleMapsAutocompleteModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyCGJTkR9DY1_naXdURraEI2qXMCx1Yv3n0',
            libraries: ['places']
        })
    ],
    exports: [],
    providers: [
        LoginService, NgbActiveModal
    ]
})
export class LoginModule {
    
}