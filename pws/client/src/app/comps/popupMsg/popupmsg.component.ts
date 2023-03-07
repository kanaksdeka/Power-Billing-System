import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
 
@Component({
  selector: 'app-my-bootstrap-modal',
  templateUrl: './popupmsg.component.html',
  styleUrls: ['./popupmsg.component.scss']
})
export class PopupMsgComponent implements OnInit {
 
  @Input() fromParent;
 
  constructor(
    public activeModal: NgbActiveModal, private router:Router
  ) { }
 
  ngOnInit() {
    console.log(this.fromParent);
    /* Output:
     {prop1: "Some Data", prop2: "From Parent Component", prop3: "This Can be anything"}
    */
  }
 
  closeModal(sendData) {
    this.activeModal.close(sendData);
    this.router.navigate(['/home']);
  }
 
}