import { Component, ViewChild, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSidenav, MatButton } from '@angular/material';
import { NetlifyIdentityService } from '../shared/netlify-identity.service';

@Component({
  selector: 'app-mainnav',
  templateUrl: './mainnav.component.html',
  styleUrls: ['./mainnav.component.scss']
})
export class MainnavComponent implements OnInit {
  @ViewChild(MatSidenav, { static: false }) sidenav: MatSidenav;
  @ViewChild('handsetmenu', { static: false }) handsetmenu: MatButton;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  netlifyService: NetlifyIdentityService;
  constructor(private breakpointObserver: BreakpointObserver, ns: NetlifyIdentityService) {
    this.netlifyService = ns;
  }

  openModal(): void {
    console.log('open modal');
    this.netlifyService.get().open();
  }

  logOut(): void {
    console.log('logout');
    this.netlifyService.get().logout();
  }

  closeSidenav() {
    // only closes sidenav if in handset mode
    // we're sure we're in handset mode if the handset menu button was found
    if (this.handsetmenu) {
      this.sidenav.close();
    }
  }

  ngOnInit() {
    this.netlifyService.init();

  }

}
