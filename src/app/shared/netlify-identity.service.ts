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
        console.log('init', user)
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
        console.error('Error', err)
      });

      netlifyIdentity.on('open', function() {
        console.log('Widget opened')
      });

      netlifyIdentity.on('close', function() {
        console.log('Widget closed');
      });
    }

    get(): any {
        return netlifyIdentity;
    }
  }
