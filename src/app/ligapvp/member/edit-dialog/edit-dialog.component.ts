import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, ErrorStateMatcher } from '@angular/material';
import { FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { Player } from 'src/app/shared/ligapvp.module';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent implements OnInit {
  emailFormControl = new FormControl('', [
    // Validators.required,
    Validators.email,
  ]);
  matcher = new MyErrorStateMatcher();
  allTeams = ['Aqua', 'Flare', 'Magma', 'Rocket', 'Galactic', 'Plasma', 'Skull'];

  constructor(public dialogRef: MatDialogRef<EditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
    this.emailFormControl.setValue(this.data.email);
    // this.emailFormControl
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    // console.log('submitted form ' + this.emailFormControl.value);
    this.data.email = this.emailFormControl.value;
    this.dialogRef.close(this.data);
  }

  getTierIcon(wr: number): string {
    return Player.getTierIconFromWinrate(wr);
  }

}

export interface DialogData {
  name: string;
  team: string;
  email?: string;
  winrate?: number;
  badges?: number;
  medals?: number;
  roles?: string[];
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
