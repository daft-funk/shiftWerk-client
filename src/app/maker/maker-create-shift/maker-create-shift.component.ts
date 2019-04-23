import { Component,  EventEmitter, OnInit, Output, Input } from '@angular/core';
import { UserService } from '../../user.service';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-maker-create-shift',
  templateUrl: './maker-create-shift.component.html',
  styleUrls: ['./maker-create-shift.component.scss'],
})

export class MakerCreateShiftComponent implements OnInit {

  sForm: FormGroup;
  count = 0;
  position: FormGroup;
  view: any;

  @Input()
  maker: any;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public toastController: ToastController,
    private router: Router) {
  }

  @Output() NavClick = new EventEmitter<'home'>();

  async presentToast(answer) {
    const toast = await this.toastController.create({
      message: `Event ${answer}...Thanks!`,
      duration: 2000,
      color: 'primary',
      position: 'top'
    });
    toast.present();
  }

  ngOnInit() {
    this.sForm = new FormGroup({
      name: new FormControl(),
      address: new FormControl(),
      start: new FormControl(),
      end: new FormControl(),
      description: new FormControl(),
      positions: new FormArray([])
    });
  }

  get positions () {
    return this.sForm.get('positions') as FormArray;
  }

  addPosition() {
    this.position = new FormGroup({
      [`position${this.count}`]: new FormControl(),
      // [`quantity${this.count}`]: new FormControl(),
      [`payment_amnt${this.count}`]: new FormControl(),
      [`payment_type${this.count}`]: new FormControl(),
    });
    this.positions.push(this.position);
    this.count++;
  }

  deletePosition(i) {
    this.positions.removeAt(i);
  }


  submit() {
    this.userService.submitShift(this.sForm.value).subscribe(response => {
      console.log(response);
      this.presentToast('created');
      this.NavClick.emit('home');
      }, error => alert(JSON.stringify(error)));
    // create shift - on submit click =>
    // redirect to home-unfilled-shifts (to invite)
    // this.view = 'home';
  }
  update(answer) {
    console.log('Toast Submit');
    this.presentToast(answer);
  }
}
