import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MainnavComponent } from './mainnav/mainnav.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gengarbobo';
  @ViewChild(MainnavComponent, {static: false}) navcomponent: MainnavComponent;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // (<any>window).ga("set", "page", event.urlAfterRedirects);
        // (<any>window).ga("send", "pageview");
        // (<any>window).gtag('config', 'UA-122077579-2', {'page_path': event.urlAfterRedirects});
        ( window as any).gtag('config', 'UA-122077579-2', {page_path: event.urlAfterRedirects});
      }
    });
  }

  public onRouterOutletActivate(event: any) {
    // this.navcomponent.setContent(event);
  }
}
