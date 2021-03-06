import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, ErrorStateMatcher } from '@angular/material';
import { FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { Player, PlayerData } from 'src/app/shared/ligapvp.module';

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
  roles = {
    admin: false,
    leader: false,
    friends: false,
  };

  constructor(public dialogRef: MatDialogRef<EditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PlayerData) { }

  ngOnInit() {
    this.emailFormControl.setValue(this.data.email);

    if (this.data.roles) {
      this.roles.admin = this.data.roles.includes('admin');
      this.roles.leader = this.data.roles.includes('leader');
      this.roles.friends = this.data.roles.includes('friends');
    }
    // this.emailFormControl
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    this.data.email = this.emailFormControl.value;
    this.data.team = this.data.team.toLowerCase();
    const rolesSet = new Set(this.data.roles);
    if (this.roles.admin) { rolesSet.add('admin'); } else { rolesSet.delete('admin'); }
    if (this.roles.leader) { rolesSet.add('leader'); } else { rolesSet.delete('leader'); }
    if (this.roles.friends) { rolesSet.add('friends'); } else { rolesSet.delete('friends'); }
    // this.data.roles = [...rolesSet];
    this.data.roles = Array.from(rolesSet) ;
    this.dialogRef.close(this.data);
  }

  getTierIcon(wr: number): string {
    return Player.getTierIconFromWinrate(wr);
  }

}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
