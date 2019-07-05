import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GitserviceService {
  url = 'https://api.github.com/repos/vibrunazo/gengarbobo/commits';

  constructor(private http: HttpClient) { }

  getGit() {
    return this.http.get(this.url);
  }
}
