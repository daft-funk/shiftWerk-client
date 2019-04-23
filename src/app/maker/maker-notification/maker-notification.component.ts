import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-maker-notification',
  templateUrl: './maker-notification.component.html',
  styleUrls: ['./maker-notification.component.scss'],
})
export class MakerNotificationComponent implements OnInit {

  constructor() { }
  @Output() onRespond = new EventEmitter<object>();
  @Input() application: any;

  respond(status: string) {
    console.log(status, this.application.shiftId, this.application.id);
    this.onRespond.emit({
      werkerId: this.application.id,
      shiftId: this.application.shiftId,
      status,
    });
  }

  ngOnInit() {}

}
