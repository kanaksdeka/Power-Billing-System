import { Component, OnInit } from "@angular/core";
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import { AboutEBComponent } from '../../landing/abouteb/about-eb.component';
import { FromData } from 'src/app/models/formData.model';
import { ResultService } from 'src/app/service/result.service';
import { ResultWOSUData } from 'src/app/models/resultWOSU.model';
import { LoginPopupComponent } from '../signinPopUp/loginPopup.component';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/service/app.service';

@Component({
    selector: 'user-dashboard',
    templateUrl: 'nometerdashboardlo.component.html',
    styleUrls: ['nometerdashboardlo.component.scss']
})
export class UserDashboardWithoutMeterloComponent implements OnInit {

  test;
  profile;
  //usagesList = [];
  //costList = [];

  constructor(private appService: AppService, private resultService: ResultService, private modalService: NgbModal, public activeModal: NgbActiveModal) { }

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
    this.appService.openDashboardInput = false;

    this.profile = this.appService.profile;
    this.goToResultWOSU();

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
          labelString: 'Usage',
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
          labelString: 'Cost',
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
  precSelectedPlan;
  precSelectedPlanImage = '';

  energyProvider = '';
  contractLength = '';
  invoideMonth = '';

  contractLengthList = new Set();

  usage = 451;
  zip = '77494';
  month = 2;

  whatYouSave = true;
  whatYouPay = false;

  whatYouPayForm = { usage: '', amount: '', month: 'Selet Month' };

  providerListMap = new Set();
  providerList = [];

  averageCost = 0;
  averateUsage = 0;
  annualSaving = 0;

  invoideMonthDropDownList = [
    1,2,3,4,5,6,7,8,9,10,11,12
  ]

  contractLengthDropDown(val) {
    this.contractLength = val;

    this.result = []
    for (let i = 0; i < this.result1.length; i++) {
      if (this.result1[i].term_value === val || 'ALL' === val) {
        this.result.push(this.result1[i]);
      }
    }

    if (this.result.length > 0) {
      this.selectedPlan(this.result[0]);
    }
  }

  EnergyProviderDropDown(val) {
    this.energyProvider = val;

    this.result = []
    for (let i = 0; i < this.result1.length; i++) {
      if (this.result1[i].company_name === val || 'ALL' === val) {
        this.result.push(this.result1[i]);
      }
    }

    if (this.result.length > 0) {
      this.selectedPlan(this.result[0]);
    }
  }

  invoideMonthDropDown(val) {
    this.whatYouPayForm.month = val;
  }

  recommendedClicked(opt) {
    this.promotional = false;
    this.renewable = false;
    this.goToResultWOSU();
  }

  renewableClicked(opt) {
    this.recommended = false;
    this.promotional = false;
    this.goToResultWOSU();
  }

  promotionalClicked(opt) {
    this.recommended = false;
    this.renewable = false;
    this.goToResultWOSU();
  }

  whatYouCanSave() {
    this.whatYouSave = true;
    this.whatYouPay = false;
    console.log('whatYouCanSave()');
  }

  whatYouPayCurrently() {
    this.whatYouSave = false;
    this.whatYouPay = true;
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

    this.getChartData(this.usage, this.month);
  }

  getChartData(usage, month) {
    this.resultService.getChartData(usage, month).subscribe(
      (res) => {
        console.log('Success in getChartData: ', res);

        let usagesList = [];
        let costList = [];

        let totalUsage = 0;
        let totalCost = 0;

        for (let i = 0; i < res.predictedusage.length; i++) {
          usagesList.push(res.predictedusage[i]);

          let cost = res.predictedusage[i] * (Number(this.precSelectedPlan.tdu_var_rate) + Number(this.precSelectedPlan.rep_var_rate)) + (Number(this.precSelectedPlan.tdu_base_rate) + Number(this.precSelectedPlan.rep_base_rate))
          costList.push(cost);

          totalUsage += Number(res.predictedusage[i]);
          totalCost += cost;
        }
        //costList.push(0);

        this.averageCost = totalCost / res.predictedusage.length;
        this.averateUsage = totalUsage / res.predictedusage.length;
        if(this.whatYouPayForm.amount === '') {
          this.annualSaving = 0;
        }
        else {
          this.annualSaving = totalCost - Number(this.whatYouPayForm.amount) * 12;
        }

        console.log('usagesList: ', usagesList);
        console.log('costList: ', costList);

        this.barChartData = [
          { data: costList, label: 'Cost', type: 'line', lineTension: 0, yAxisID: 'second-y-axis' },
          { data: usagesList, label: 'Usage', barThickness: 18 }

        ];

      },
      (err) => {
        console.log('Error in getChartData: ', err);
      }
    )
  }

  goToResultWOSU() {

    this.result1 = [];
    this.result = [];

    let formData: FromData = {
      meterId: '451', zipCode: '75057', duration: '',
      typeRecommended: this.recommended, typePromotional: this.promotional, typeRenewable: this.renewable, isAgree: true
    };

    this.resultService.profileLo = !this.resultService.profileLo;

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

  getUsage() {

    if(!this.whatYouPayForm.usage || !this.whatYouPayForm.amount || this.whatYouPayForm.month === 'Selet Month') {
      console.log('getUsage() validation error.');
      this.error = true;
      return;
    }

    this.goToResultWOSU();

    this.whatYouPay = false;
  }

  openModal(msg) {
    const modalRef = this.modalService.open(LoginPopupComponent,
      {
        scrollable: true,
        windowClass: 'myCustomModalClass',
        // keyboard: false,
        // backdrop: 'static'
        size: 'lg'
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

        this.goToResultWOSU();
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