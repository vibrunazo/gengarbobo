import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LambdaService {
  url = '/.netlify/functions/testfunc2';
  // url = 'https://gengarbobo.ca/.netlify/functions/testfunc2';
  // this.http.get("/.netlify/functions/jokeTypescript");
  // url = 'https://api.github.com/repos/vibrunazo/gengarbobo/commits';

  constructor(private http: HttpClient) {

   }

   runTest1() {
    const body = {
      name: 'vibo'
    };
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({ headers: headers });
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };
    return this.http.get(this.url);
    // return this.http.post(this.url, body, httpOptions);
  }
}
