import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as firebase from 'firebase/app';
import { fromEvent, of, from, Observable, Subscriber } from 'rxjs';
import { AuthService } from './auth.service';
import { Liga } from '../shared/ligapvp.module';
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

  async getAllMembers(): Promise<any> {
    const user = this.auth.user;
    const url = 'https://us-central1-gengarbobo.cloudfunctions.net/api/getAllMembers';
    let token: string;
    try {
      token = await user.getIdToken();
    } catch (error) {
      token = '';
    }
    const headers = new HttpHeaders({Authorization: 'Bearer ' + token });
    return await this.http.get(url, { headers }).toPromise();
  }

  async updateLigaMembers(): Promise<any> {
    let resolve; let reject;
    const p = new Promise((res, rej) => { resolve = res; reject = rej; });
    await this.getAllMembers()
      .then(r => {
        console.log('server success: ');
        console.log(r);
        Liga.setAllPlayers(r.members);
        this.emitter.next();
      })
      .catch(r => {
        console.log('server error: ');
        console.log(r);
      });
    return p;
  }
}
