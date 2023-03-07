import { Component, ViewChild } from "@angular/core";
import { merge, Subject, Observable } from 'rxjs';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import { LoginService } from 'src/app/service/login.service';

@Component({
    selector: '',
    templateUrl: 'test3.component.html'
})
export class Test3Component {
    states = [
        { company_id: '', company_name: "Select a value" },
        { company_id: '1', company_name: "Kanak" },
        { company_id: '2', company_name: "apple" },
        { company_id: '3', company_name: "a kanak d" },
        { company_id: '4', company_name: "A Apple man" },
        { company_id: '5', company_name: "cat" },
        { company_id: '6', company_name: "BigCat" }
    ];

  provider: any;

  @ViewChild('providerInstance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  constructor(private loginService: LoginService) {}

  formatter = (result: any) => result.company_name;
  inputFormatter = (result: any) => result.company_name;

  providerSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.loginService.providersMap
        : this.loginService.providersMap.filter(v => v.company_name.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }
  
}