import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LambdaService {
  url = 'https://gengarbobo.ca/.netlify/functions/testfunc2';

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
    return this.http.post(this.url, body, httpOptions);
  }
}
