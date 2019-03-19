import { Component, OnInit, Input } from '@angular/core';
import { Injectable } from '@angular/core';
import { MakerService } from 'src/app/maker.service';
import { ShiftService } from 'src/app/shift.service';
import { Maker } from 'src/app/types';

@Component({
  selector: 'app-maker-unfilled-shifts',
  templateUrl: './maker-unfilled-shifts.component.html',
  styleUrls: ['./maker-unfilled-shifts.component.scss'],
})

@Injectable({
  providedIn: 'root'
})

export class MakerUnfilledShiftsComponent implements OnInit {

  constructor(
    public makerService: MakerService,
    public shiftService: ShiftService
  ) { }
  @Input() shifts: Array<any>;

  ngOnInit() {
    this.shiftService.getAllShifts();
  }

}
