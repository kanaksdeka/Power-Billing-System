import { Component, OnInit } from "@angular/core";
import {Chart, ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import { Label, Color } from 'ng2-charts';
import { AppService } from 'src/app/service/app.service';

@Component({
    selector: 'test',
    templateUrl: 'test.component.html'
})
export class Test implements OnInit{


    constructor(private appService: AppService) {
    }

    public barChartOptions: ChartOptions = {
        responsive: true,
    
      };

      public barChartLabels: Label[] = ['Jan 2020', 'Feb 2020', 'Mar 2020', 'Apr 2020', 'May 2020'];
      public barChartType: ChartType = 'bar';
      public barChartLegend = true;
      public barChartPlugins = [];
    
      ngOnInit() {
    
        this.barChartOptions.scales = {
            yAxes: [{
                id: 'first-y-axis',
                type: 'linear',
                position: 'right',
                ticks: {
                  beginAtZero: false,
                  stepSize: 0,
                },
                gridLines: {
                  lineWidth: 0
                },
            }, {
                id: 'second-y-axis',
                type: 'linear',
                ticks: {
                  beginAtZero: false,
                  stepSize: 10,
                },
                gridLines: {
                  lineWidth: 0
                },
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
    
      public barChartData: ChartDataSets[] = [
        { data: [58, 38, 45, 35, 47], label: 'Cost', type: 'line', lineTension: 0,  yAxisID: 'second-y-axis'},
        { data: [465, 559, 380, 481, 356], label: 'Usage', radius: 50 }
        
      ];

      userList() {
        return this.appService.appList;
      }
    
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
    
      
}