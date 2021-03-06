import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as firebase from 'firebase/app';
import { fromEvent, of, from, Observable, Subscriber } from 'rxjs';
import { AuthService } from './auth.service';
import { Liga, PlayerData } from '../shared/ligapvp.module';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class LambidaService {

  // url = 'https://us-central1-gengarbobo.cloudfunctions.net/helloWorld';
  // url = 'https://us-central1-gengarbobo.cloudfunctions.net/anotherFunction';
  // url = 'https://us-central1-gengarbobo.cloudfunctions.net/authgoogleapi';
  // url = 'http://localhost:5000/gengarbobo/us-central1/api/testFunc4';
  url = 'https://us-central1-gengarbobo.cloudfunctions.net/api/testFunc4';
  // url = 'https://us-central1-gengarbobo.cloudfunctions.net/api/driveUpdate';
  dataState$: Observable<any>;
  emitter: Subscriber<any>;
  authsub;

  constructor(private http: HttpClient, private auth: AuthService) {
    this.dataState$ = new Observable(obs => {
      this.emitter = obs;
    });
    this.authsub = auth.user$.subscribe(user => this.updateUser(user));
  }

  updateUser(user: User) {
    this.updateLigaMembers();
  }

  async getLogs(): Promise<any>  {
    const url = 'https://us-central1-gengarbobo.cloudfunctions.net/api/getLog';
    try {
      return await this.sendMessage(url);
    } catch (e) {
      console.log(e);
    }
  }

  async sendFriendUpdate(newFriend) {
    const url = 'https://us-central1-gengarbobo.cloudfunctions.net/api/updateFriend';
    const body = {
      friend: newFriend,
    };
    try {
      return await this.sendMessage(url, body);
    } catch (e) {
      console.log(e);
    }
  }

  async sendMemberUpdate(newData: PlayerData): Promise<any> {
    const url = 'https://us-central1-gengarbobo.cloudfunctions.net/api/updateMember';
    const body = {
      member: newData,
    };
    try {
      return await this.sendMessage(url, body);
    } catch (e) {
      console.log(e);
    }
  }

  async sendMessage(url, body?): Promise<any>  {
    const user = this.auth.user;
    let token: string;
    try {
      token = await user.getIdToken();
    } catch (error) {
      token = '';
    }
    const headers = new HttpHeaders({Authorization: 'Bearer ' + token });
    try {
      if (!body) { return await this.http.get(url, { headers }).toPromise(); }
      return await this.http.post(url, body, { headers }).toPromise();
    } catch (e) {
      console.log(e);
    }
  }

  async getAllMembers(token): Promise<any> {
    const url = 'https://us-central1-gengarbobo.cloudfunctions.net/api/getAllMembers';
    const headers = new HttpHeaders({Authorization: 'Bearer ' + token });
    return await this.http.get(url, { headers }).toPromise();
  }
  async getAllFriends(token): Promise<any> {
    const url = 'https://us-central1-gengarbobo.cloudfunctions.net/api/getAllFriends';
    const headers = new HttpHeaders({Authorization: 'Bearer ' + token });
    return await this.http.get(url, { headers }).toPromise();
  }

  async updateLigaMembers(): Promise<any> {
    const user = this.auth.user;
    let token: string;
    try {
      token = await user.getIdToken();
    } catch (error) {
      token = '';
    }
    let resolve; let reject;
    const p = new Promise((res, rej) => { resolve = res; reject = rej; });
    try {
      const newMembers = await this.getAllMembers(token);
      const newFriends = await this.getAllFriends(token);
      console.log('server success: ');
      console.log(newMembers);
      // newMembers.roles.push('friends');
      this.auth.setRoles(newMembers.roles);
      // this.auth.setRoles([ "name:vib", "team:skull"]);
      Liga.setAllPlayers(newMembers.members);
      Liga.setAllFriends(newFriends.friends);
      this.emmitToSubs();
      resolve();
    } catch (e) {
      console.log('server error: ');
      console.log(e);
      reject();
    }
    return p;
  }

  emmitToSubs() {
    if (this.emitter) { this.emitter.next(); }
  }
}
