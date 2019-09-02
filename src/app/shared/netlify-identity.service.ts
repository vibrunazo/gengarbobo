import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

declare var netlifyIdentity: any;

@Injectable({
    providedIn: 'root',
  })

export class NetlifyIdentityService {
    constructor(router: Router) {
      netlifyIdentity.init();
      // Bind to events
      netlifyIdentity.on('init', function(user) {
        console.log('init', user);
      });

      netlifyIdentity.on('login', function(user) {
        console.log('current user', netlifyIdentity.currentUser());
        netlifyIdentity.close();
      });

      netlifyIdentity.on('logout', function() {
        console.log('Logged out');
        netlifyIdentity.close();
        router.navigateByUrl('/');
      });

      netlifyIdentity.on('error', function(err) {
        console.error('Error', err);
      });

      netlifyIdentity.on('open', function() {
        console.log('Widget opened');
        // frames['netlify-identity-widget'][1].contentWindow.document.getElementsByClassName('modalContent').style.backgroundColor = 'red';
        setTimeout(function(){

          const f = frames['netlify-identity-widget'][1];
          const e = f.contentWindow.document.getElementsByClassName('modalContent')[0];
          console.log(e);
          e.children[2].style.display = 'none';
          e.children[3].children[0].style.display = 'none';
        }, 1000);

      });

      netlifyIdentity.on('close', function() {
        console.log('Widget closed');
      });
    }

    get(): any {
        return netlifyIdentity;
    }
  }
