import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { User } from './user.model';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Player } from '../shared/ligapvp.module';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User>;
  user: firebase.User;
  myRoles: string[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        this.user = user;
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  async signOut() {
    await this.afAuth.auth.signOut();
    // return this.router.navigate(['/']);
  }

  updateUserData({ uid, email, displayName, photoURL}: User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${uid}`);

    const data = {
      uid,
      email,
      displayName,
      photoURL
    };

    return userRef.set(data, { merge: true });
  }

  setRoles(newRoles: string[]) {
    this.myRoles = newRoles;
  }

  canIeditPlayer(player: Player): boolean {
    if (this.myRoles.length === 0) { return false; }
    if (this.myRoles.includes('name:' + player.getName().split('.').join('').toLowerCase())) { return true; }
    if (this.myRoles.includes('admin')) { return true; }
    if (this.myRoles.includes('site')) { return true; }
    if (this.myRoles.includes('friends') && this.myRoles.includes('team:' + player.getTeam().toLowerCase())) { return true; }
    return false;
  }
}
