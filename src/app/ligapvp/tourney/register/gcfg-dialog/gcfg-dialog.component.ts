import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TourneyGroup } from '../../tourney.module';

@Component({
  selector: 'app-gcfg-dialog',
  templateUrl: './gcfg-dialog.component.html',
  styleUrls: ['./gcfg-dialog.component.scss']
})
export class GcfgDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<GcfgDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: TourneyGroup) { }

  ngOnInit() {
    console.log('init dialog');
    console.log(this.data);

  }

}
