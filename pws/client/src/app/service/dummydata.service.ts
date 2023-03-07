import { Injectable } from "@angular/core";

@Injectable({providedIn:'root'})
export class DummyData {
    addressList = {
        "address": [
            {
                "meter_id": "1008901023901266050117",
                "address": "8606 BROOKDALE PARK LN",
                "address_2": "",
                "city": "RICHMOND",
                "state": "TX",
                "zip": "77407",
                "plus4": "0000",
                "meter_read_cycle": "18",
                "meter_status": "A",
                "premise_type": "Residential",
                "metered": "Y",
                "power_region": "ERCOT",
                "stationcode": "OB",
                "stationname": "OBRIEN",
                "tdsp_duns": "957877905",
                "polr_customer_class": "Residential",
                "smart_meter": "Y",
                "tdsp_name": "CENTERPOINT",
                "trans_count": "0",
                "service_orders": "",
                "tdsp_ams_indicator": "AMSR",
                "switch_hold_indicator": "N"
            }
        ]
    };

    chartData = {
        "predictedusage": [
            {
                "usage": 455,
                "month": "March",
                "year": 2020
            },
            {
                "usage": 441,
                "month": "April",
                "year": 2020
            },
            {
                "usage": 517,
                "month": "May",
                "year": 2020
            },
            {
                "usage": 710,
                "month": "June",
                "year": 2020
            },
            {
                "usage": 916,
                "month": "July",
                "year": 2020
            },
            {
                "usage": 914,
                "month": "August",
                "year": 2020
            },
            {
                "usage": 797,
                "month": "September",
                "year": 2020
            },
            {
                "usage": 626,
                "month": "October",
                "year": 2020
            },
            {
                "usage": 476,
                "month": "November",
                "year": 2020
            },
            {
                "usage": 544,
                "month": "December",
                "year": 2020
            },
            {
                "usage": 635,
                "month": "January",
                "year": 2021
            },
            {
                "usage": 541,
                "month": "February",
                "year": 2021
            }
        ]
    };
    
}