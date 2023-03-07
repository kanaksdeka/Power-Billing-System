import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import { AboutEBComponent } from '../../landing/abouteb/about-eb.component';
import { FromData } from 'src/app/models/formData.model';
import { ResultService } from 'src/app/service/result.service';
import { ResultWOSUData } from 'src/app/models/resultWOSU.model';
import { LoginPopupComponent } from '../signinPopUp/loginPopup.component';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/service/app.service';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';
import { LoginPopupMsgComponent } from '../popupMsg/popupmsglogin.component';

@Component({
  selector: 'user-dashboard',
  templateUrl: 'userdashboard.component.html',
  styleUrls: ['userdashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserDashboardComponent implements OnInit {

  test;
  profile;

  whatYouPayInputOn = false;

  status = {
    esiid: false,
    meter: false,
    profilestat: false,
    emailConfirmStatus: false,
    pendingauthStatus: false
  };
  //usagesList = [];
  //costList = [];

  constructor(private appService: AppService,
    private loginService: LoginService,
    private resultService: ResultService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private router: Router) { }

  public barChartOptions: ChartOptions = {
    responsive: true,

  };
  public barChartOptions2: ChartOptions = {
    responsive: true,

  };
  public barChartLabels: Label[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',];
  public barChartLabels2: Label[] = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  ngOnInit() {

    if (this.appService.openDashboardInput) {
      this.whatYouPay = true;
      this.whatYouSave = false;
      this.whatYouPayInputOn = true;
    }
    this.appService.openDashboardInput = false;

    //if (this.router.url === '/dashboardnopfl') {
    //  this.whatYouPay = true;
    //}

    //go to home page if not logged-in
    this.shallGoToHomePage();

    this.profile = this.appService.profile;
    this.status = this.appService.status;
    this.zip = this.appService.address.zipcode;
    this.goToResultWOSU(this.usage, this.zip);

    this.barChartOptions.scales = {
      yAxes: [{
        id: 'first-y-axis',
        type: 'linear',
        display: true,
        position: 'right',
        ticks: {
          beginAtZero: false,
          stepSize: 0,
        },
        gridLines: {
          lineWidth: 0
        },
        scaleLabel: {
          display: true,
          labelString: 'Usage (kWh)',
          fontColor: '#2abc26',
          fontSize: 18,
          fontStyle: 'bold'
        }
      },
      {
        id: 'second-y-axis',
        type: 'linear',
        ticks: {
          beginAtZero: false,
          stepSize: 10,
        },
        gridLines: {
          lineWidth: 0
        },
        scaleLabel: {
          display: true,
          labelString: 'Cost ($)',
          fontColor: '#00187b',
          fontSize: 18,
          fontStyle: 'bold'
        }
      }],
      xAxes: [
        {
          gridLines: {
            lineWidth: 0
          },
          ticks: {
            beginAtZero: false,
          }
        }
      ]
    }
  }

  //public barChartData: ChartDataSets[] = [
  //  { data: [165, 259, 180, 181, 356, 255, 270, 165, 359, 280, 281, 156, 355, 140], label: 'Usage' },
  //  { data: [180, 181, 256, 355, 170, 165, 259, 280, 281, 256, 155, 140, 365, 159], label: 'Cost' }
  //];

  public barChartData: ChartDataSets[] = [
    { data: [], label: 'Cost', type: 'line', lineTension: 0, yAxisID: 'second-y-axis' },
    { data: [], label: 'Usage', barThickness: 18 }

  ];

  public lineChartColors: Color[] = [

    { // line blue
      //backgroundColor: 'rgba(148,159,177,0.2)',
      backgroundColor: 'rgba(148,159,177,0)',
      borderColor: '#00187b',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },

    { // bar green
      backgroundColor: 'rgba(42, 188, 38)',
      borderColor: '#17b50d',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // green
      backgroundColor: '#2abc26',
      borderColor: 'gray',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)',
      borderDash: [12.30]
    },
  ];



  /* ******** normal code starts frm here ********* */
  error;

  result1 = [];
  result = [];
  recommended = true;
  promotional = false;
  renewable = false;
  precSelectedPlan = {
    active: false,
    tdu_var_rate: '',
    rep_var_rate: '',
    tdu_base_rate: '',
    rep_base_rate: '',
    special_terms: '',
    fact_sheet: '',
    price_kwh500: '',
    price_kwh1000: '',
    price_kwh2000: '',
    enroll_phone: '',
    pricing_details: '',
    terms_of_service: ''
  };
  precSelectedPlanImage = '';

  energyProvider = 'Energy Provider';
  contractLength = 'Contract Length';
  invoideMonth = '';

  contractLengthList = new Set();

  usage = 451;
  zip = '77494';
  month = new Date().getMonth() + 1;

  whatYouSave = true;
  whatYouPay = false;

  whatYouPayForm = { usage: '', amount: '', month: { code: '', value: 'Selet Month' } };

  providerListMap = new Set();
  providerList = [];

  averageCost = 0;
  averateUsage = 0;
  annualSaving = 0;

  invoideMonthDropDownList = [
    { code: 1, value: 'January' }, { code: 2, value: 'February' }, { code: 3, value: 'March' }, { code: 4, value: 'April' }, { code: 5, value: 'May' }, { code: 6, value: 'June' }, { code: 7, value: 'August' }, { code: 8, value: 'September' }, { code: 9, value: 'October' }, { code: 10, value: 'November' }, { code: 11, value: '' }, { code: 12, value: 'December' }
  ];

  contractLengthDropDown(val) {
    this.contractLength = val;

    this.result = []

    if (this.energyProvider === '' || this.energyProvider === 'ALL' || this.energyProvider === 'Energy Provider') {
      for (let i = 0; i < this.result1.length; i++) {
        if (this.result1[i].term_value === val || 'ALL' === val) {
          this.result.push(this.result1[i]);
        }
      }
    }
    else {
      for (let i = 0; i < this.result1.length; i++) {
        if ((this.result1[i].term_value === val && this.result1[i].company_name === this.energyProvider) || (this.result1[i].company_name === this.energyProvider && 'ALL' === val)) {
          this.result.push(this.result1[i]);
        }
      }
    }

    if (this.result.length > 0) {
      this.selectedPlan(this.result[0]);
    }
  }

  EnergyProviderDropDown(val) {
    this.energyProvider = val;

    this.result = []

    if (this.contractLength === '' || this.contractLength === 'ALL' || this.contractLength === 'Contract Length') {
      for (let i = 0; i < this.result1.length; i++) {
        if (this.result1[i].company_name === val || 'ALL' === val) {
          this.result.push(this.result1[i]);
        }
      }
    }
    else {
      for (let i = 0; i < this.result1.length; i++) {
        if ((this.result1[i].company_name === val && this.result1[i].term_value === this.contractLength) || (this.result1[i].term_value === this.contractLength && 'ALL' === val)) {
          this.result.push(this.result1[i]);
        }
      }
    }

    if (this.result.length > 0) {
      this.selectedPlan(this.result[0]);
    }
  }

  invoideMonthDropDown(val) {
    this.whatYouPayForm.month = val;
    this.month = val.code;
  }

  recommendedClicked(opt) {
    this.promotional = false;
    this.renewable = false;
    this.recommended = true;

    this.energyProvider = 'Energy Provider';
    this.contractLength = 'Contract Length';

    this.goToResultWOSU(this.usage, this.zip);
  }

  renewableClicked(opt) {
    this.recommended = false;
    this.promotional = false;
    this.renewable = true;

    this.energyProvider = 'Energy Provider';
    this.contractLength = 'Contract Length';

    this.goToResultWOSU(this.usage, this.zip);
  }

  promotionalClicked(opt) {
    this.recommended = false;
    this.renewable = false;
    this.promotional = true;

    this.energyProvider = 'Energy Provider';
    this.contractLength = 'Contract Length';

    this.goToResultWOSU(this.usage, this.zip);
  }

  whatYouCanSave() {
    this.whatYouSave = true;
    this.whatYouPay = false;

    if (this.whatYouPayForm.month.code === '') {
      this.getChartData(this.usage, this.month);
    }
    else {
      this.getChartData(this.whatYouPayForm.usage, this.whatYouPayForm.month.code);
    }

    console.log('whatYouCanSave()');
  }

  whatYouPayCurrently() {
    this.whatYouSave = false;
    this.whatYouPay = true;

    this.whatYouPayInputOn = true;

    console.log('whatYouPayCurrently()');
    //this.openModal('what-you-pay');
  }

  selectedPlan(row) {
    console.log('Selected plan: ', this.precSelectedPlan);

    if (this.precSelectedPlan) {
      this.precSelectedPlan.active = false;
    }

    row.active = true;
    this.precSelectedPlanImage = row.company_logo;
    this.precSelectedPlan = row;

    if (this.whatYouPayForm.usage) {
      this.getChartData(this.whatYouPayForm.usage, this.whatYouPayForm.month.code);
    }
    else {
      this.getChartData(this.usage, this.month);
    }
  }

  getChartData(usage, month) {
    this.resultService.getChartData(usage, month).subscribe(
      (res) => {
        console.log('Success in getChartData: ', res);

        let usagesList = [];
        let costList = [];

        let totalUsage = 0;
        let totalCost = 0;
        let cost = 0;

        let xAxis = [];
        for (let i = 0; i < res.predictedusage.length; i++) {
          usagesList.push(res.predictedusage[i].usage);
          xAxis.push(res.predictedusage[i].month + ' ' + res.predictedusage[i].year);

          if (this.whatYouCanSave) {
            cost = res.predictedusage[i].usage * (Number(this.precSelectedPlan.tdu_var_rate) + Number(this.precSelectedPlan.rep_var_rate)) + (Number(this.precSelectedPlan.tdu_base_rate) + Number(this.precSelectedPlan.rep_base_rate))
          }
          else {
            //TODO need to check with Sudeep
            cost = res.predictedusage[i].usage * (Number(this.precSelectedPlan.tdu_var_rate) + Number(this.precSelectedPlan.rep_var_rate)) + (Number(this.precSelectedPlan.tdu_base_rate) + Number(this.precSelectedPlan.rep_base_rate))
            cost = cost - Number(this.whatYouPayForm.amount);
          }
          costList.push(cost);

          totalUsage += Number(res.predictedusage[i].usage);
          totalCost += cost;
        }
        //costList.push(0);

        this.averageCost = totalCost / res.predictedusage.length;
        this.averateUsage = totalUsage / res.predictedusage.length;
        if (this.whatYouPayForm.amount === '') {
          this.annualSaving = 0;
        }
        else {
          this.annualSaving = (Number(this.whatYouPayForm.amount) * 12) - totalCost;
        }

        console.log('usagesList: ', usagesList);
        console.log('costList: ', costList);

        this.barChartData = [
          { data: costList, label: 'Cost', type: 'line', lineTension: 0, yAxisID: 'second-y-axis' },
          { data: usagesList, label: 'Usage', barThickness: 18 }

        ];

        this.barChartLabels = xAxis;

      },
      (err) => {
        console.log('Error in getChartData: ', err);
      }
    )
  }

  goToResultWOSU(usage, zipCode) {

    if (!this.recommended && !this.promotional && !this.renewable) {
      return;
    }

    this.result1 = [];
    this.result = [];

    let formData: FromData = {
      meterId: usage, zipCode: zipCode, duration: '',
      typeRecommended: this.recommended, typePromotional: this.promotional, typeRenewable: this.renewable, isAgree: true
    };

    this.resultService.getRates(formData).subscribe(
      (res) => {
        //console.log("Response Data: ", res);

        this.providerList = [];
        this.providerListMap = new Set();
        this.providerListMap.add('ALL');

        this.contractLengthList = new Set();
        this.contractLengthList.add('ALL');

        for (let index = 0; index < res.length; index++) {
          res[index].pricing_details = res[index].pricing_details.substring(18);
          res[index].active = false;

          this.providerListMap.add(res[index].company_name);
          this.contractLengthList.add(res[index].term_value)

          if (index === 0) {
            this.selectedPlan(res[0])
          }
        }

        this.providerList = Array.from(this.providerListMap.keys());
        this.result1 = res;
        this.result = res;

        console.log("Response data", this.result1);
      }, (err) => {
        console.log("Error", err)
      }
    )
  }

  shallGoToHomePage() {
    if (!this.appService.getIsLoggedIn() || this.appService.address.zipcode === '') {
      this.router.navigate(['/home']);
    }
  }

  getCurrentProvider() {
    if (this.profile.currentprovider) {
      let providerObj = this.loginService.getProviderWithKey(this.profile.currentprovider);
      if (providerObj) {
        return providerObj.company_name
      }
    }

    return '';
  }

  getContractEndDate() {
    if (this.profile.contractendingon) {
      let dt = new Date(this.profile.contractendingon)
      return dt;
    }

    return '';
  }

  getUsage() {

    if (!this.whatYouPayForm.usage || !this.whatYouPayForm.amount || this.whatYouPayForm.month.code === '') {
      console.log('getUsage() validation error.');
      this.error = true;
      return;
    }

    if(Number(this.whatYouPayForm.usage) >10000) {
      this.openModal("Maximum allowed value for Usage is 10,000");
      return;
    }

    this.energyProvider = 'Energy Provider';
    this.contractLength = 'Contract Length';

    //this.whatYouPay = false;
    this.whatYouPayInputOn = false;
    this.appService.openDashboardInput = false;

    this.goToResultWOSU(this.whatYouPayForm.usage, this.zip);
  }

  goToURL(url) {
    window.open(url, '_blank');
  }

  keyPress2(event) {
    if (event.keyCode === 13) {
      this.getUsage();
    }
  }

  openModal(msg) {
    const modalRef = this.modalService.open(LoginPopupMsgComponent,
      {
        scrollable: true,
        windowClass: 'myCustomModalClass',
        // keyboard: false,
        // backdrop: 'static'
        size: 'md'
      });

    let data = msg;

    modalRef.componentInstance.fromParent = data;
    modalRef.result.then(
      (result) => {
        console.log('Success Modal data returned: ', result);

        if (!result.usage || !result.month) {
          return;
        }

        this.usage = result.usage;
        this.month = result.month;

        this.goToResultWOSU(result.usage, this.zip);
      },
      (reason) => {
        console.log('Error in Modal data returned: ', reason);
      }
    );

    /*
    modalRef.componentInstance.myEvent.subscribe((receivedEntry) => {
      console.log(receivedEntry);
      })
    */
  }

}