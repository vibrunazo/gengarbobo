import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LambidaService } from 'src/app/services/lambida.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  authsub;
  user;
  myRoles: string[] = [];

  constructor(private auth: AuthService, private lambida: LambidaService) {
    this.authsub = auth.user$.subscribe(user => this.updateUser(user));
    this.lambida.dataState$.subscribe(this.updateData.bind(this));
   }

  ngOnInit() {
    this.myRoles = this.auth.getRoles();
  }

  updateUser(user) {
    this.user = user;
  }
  updateData() {
    this.myRoles = this.auth.getRoles();
    console.log(this.myRoles);

  }

  isAdmin(): boolean {
    if (this.myRoles.includes('admin') || this.myRoles.includes('site')) { return true; }
    return false;
  }

}
