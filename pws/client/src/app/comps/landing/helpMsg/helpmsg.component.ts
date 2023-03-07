import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
 
@Component({
  selector: 'help-msg',
  templateUrl: './helpmsg.component.html',
  styleUrls: ['./helpmsg.component.scss']
})
export class HelpMsgComponent implements OnInit {
 
  @Input() fromParent;
 
  constructor(
    public activeModal: NgbActiveModal
  ) { }
 
  ngOnInit() {
    console.log(this.fromParent);
    /* Output:
     {prop1: "Some Data", prop2: "From Parent Component", prop3: "This Can be anything"}
    */
  }
 
  closeModal(sendData) {
    this.activeModal.close(sendData);
  }
 
}