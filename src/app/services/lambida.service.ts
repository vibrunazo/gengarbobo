import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class LambidaService {

  // url = 'https://us-central1-gengarbobo.cloudfunctions.net/helloWorld';
  url = 'http://localhost:5000/gengarbobo/us-central1/api/testFunc4';
  // url = 'https://us-central1-gengarbobo.cloudfunctions.net/api/testFunc4';

  constructor(private http: HttpClient) { }

  testFunc1() {
    return this.http.get(this.url, {responseType: 'text'});

  }

  testFunc2() {
    console.log(firebase.auth());
    let user;
    const state = firebase.auth().onAuthStateChanged((u) => {
      user = u;
      if (u) {
        u.getIdToken().then(authToken => {
          console.log('authToken');
          console.log(authToken);
          post.bind(this)(authToken);
        });
      } else {
        post.bind(this)('authToken');
      }
    });

    function post(token) {
      const headers = new HttpHeaders({Authorization: 'Bearer ' + token });

      const myUID    = { uid: 'current-user-uid' };    // success 200 response
      const notMyUID = { uid: 'some-other-user-uid' }; // error 403 response

      this.http.post(this.url, myUID, { responseType: 'text', headers }).toPromise().then(r => {
        console.log('server responded:');
        console.log(r);
      }).catch(f => {
        console.log('server failed:');
        console.log(f);

      });
    }


    // firebase.auth().currentUser.getIdToken()
    //   .then(authToken => {
    //     const headers = new HttpHeaders({Authorization: 'Bearer ' + authToken });

    //     const myUID    = { uid: 'current-user-uid' };    // success 200 response
    //     const notMyUID = { uid: 'some-other-user-uid' }; // error 403 response

    //     return this.http.post(this.url, myUID, { headers }).toPromise();
    //   })
    //   .then(res => console.log(res));
  }
}
