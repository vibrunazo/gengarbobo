import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NetlifyIdentityService } from './netlify-identity.service';
import { tap } from 'rxjs/operators';

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
      console.log('not logged in');
      return this.runTest2();
    }
    const id = this.identity.get().currentUser().email;
    const token = this.identity.get().currentUser().token.access_token;
    console.log('id:');
    console.log(id);
    console.log('token:');
    console.log(token);

    const body = {
      name: id
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer '  + token,
        'random-header': 'yess'
      })
    };
    // return this.http.get(this.url);
    return this.http.post(this.url, body, httpOptions);
  }

  runTest2() {
    // const body = {
    //   name: 'id moo 2'
    // };
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type':  'application/json',
    //   })
    // };

    // return this.http.post(this.url, body, httpOptions);
    return this.http.get(this.url, {responseType: 'text'})
    .pipe(
      tap( // Log the result or error
        data => console.log(this.url, data),
        error => console.log(this.url, error)
      )
    );
    return this.http.get(this.url);

  }
}
