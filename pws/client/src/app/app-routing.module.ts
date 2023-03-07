import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.components';
import { ResultWithoutSignUp } from './comps/landing/resultsWithoutSignUp/resultwosu.component';
import { LoginModule } from './comps/login/login.module';
import { ActivationComponent } from './comps/login/activation/activation.component';


const routes: Routes = [{path:"home", component: HomeComponent},
{path:"faq", component: HomeComponent},
{path:"reviews", component: HomeComponent},
{path:"feature", component: HomeComponent},
{path:"results", component: ResultWithoutSignUp},
{path:"**", component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes), LoginModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
