import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NetlifyIdentityService } from './netlify-identity.service';

@Injectable({
  providedIn: 'root'
})
export class LambdaService {
  url = '/.netlify/functions/testfunc';
  // url = 'https://gengarbobo.ca/.netlify/functions/testfunc2';
  // this.http.get("/.netlify/functions/jokeTypescript");
  // url = 'https://api.github.com/repos/vibrunazo/gengarbobo/commits';

  constructor(private http: HttpClient, private identity: NetlifyIdentityService) {

   }

   runTest1() {
    if (!this.identity.get().currentUser()) {
      console.log('not logged int');
    }
    const id = this.identity.get().currentUser().email;
    const token = this.identity.get().currentUser().token.access_token;
    console.log('id:');
    console.log(id);

    const body = {
      name: id
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
      })
    };
    // return this.http.get(this.url);
    return this.http.post(this.url, body, httpOptions);
  }
}
