import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

declare var netlifyIdentity: any;

@Injectable({
    providedIn: 'root',
  })

export class NetlifyIdentityService {
    constructor(private router: Router) {
    }

    init() {
      const opts = {
        container: '#topBar', // container to attach to
        // namePlaceholder: 'some-placeholder-for-Name', // custom placeholder for name input form
      };
      netlifyIdentity.init();
      // netlifyIdentity.init(opts);
      // Bind to events
      netlifyIdentity.on('init', (user) => {
        console.log('init', user);
      });

      netlifyIdentity.on('login', (user) => {
        console.log('current user', netlifyIdentity.currentUser());
        netlifyIdentity.close();
      });

      netlifyIdentity.on('logout', () => {
        console.log('Logged out');
        netlifyIdentity.close();
        this.router.navigateByUrl('/');
      });

      netlifyIdentity.on('error', (err) => {
        console.error('Error', err);
      });

      netlifyIdentity.on('open', () => {
        console.log('Widget opened');
        // frames['netlify-identity-widget'][1].contentWindow.document.getElementsByClassName('modalContent').style.backgroundColor = 'red';
        setTimeout(removeCss, 1);

        function removeCss() {
          try {
            const f = frames['netlify-identity-widget'][1];
            const e = f.contentWindow.document.getElementsByClassName('modalContent')[0];
            console.log(e);
            e.children[2].style.display = 'none';
            e.children[3].children[0].style.display = 'none';
          } catch (error) {
            setTimeout(removeCss, 100);
          }
        }

      });

      netlifyIdentity.on('close', () => {
        console.log('Widget closed');
      });
    }

    get(): any {
        return netlifyIdentity;
    }
  }
