import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSidenav, MatButton } from '@angular/material';

@Component({
  selector: 'app-mainnav',
  templateUrl: './mainnav.component.html',
  styleUrls: ['./mainnav.component.scss']
})
export class MainnavComponent {
  @ViewChild(MatSidenav, { static: false }) sidenav: MatSidenav;
  @ViewChild('handsetmenu', { static: false }) handsetmenu: MatButton;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  constructor(private breakpointObserver: BreakpointObserver) {}

  closeSidenav() {
    // only closes sidenav if in handset mode
    // we're sure we're in handset mode if the handset menu button was found
    if (this.handsetmenu) {
      this.sidenav.close();
    }
  }
}
