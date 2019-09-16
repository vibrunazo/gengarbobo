import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Player, Liga, Nivel, PlayerData } from 'src/app/shared/ligapvp.module';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, Right } from 'src/app/services/auth.service';
import { User } from 'src/app/services/user.model';
import { LambidaService } from 'src/app/services/lambida.service';
import { MatDialog } from '@angular/material';
import { EditDialogComponent } from './edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MemberComponent implements OnInit {
  player: Player;
  name = '';
  friends: Player[] = [];
  enemies: Player[] = [];
  dia: Player[] = [];
  rub: Player[] = [];
  saf: Player[] = [];
  colleagues: Player[] = [];
  nonfriends: Player[] = [];
  filter = 'all';
  authsub;
  user: User;
  rights: Right[] = [];
  canIedit = false;
  canIeditFriends = false;
  editModeFriends = true;

  constructor(private route: ActivatedRoute, private auth: AuthService,
              private lambida: LambidaService, public dialog: MatDialog) {
    this.authsub = auth.user$.subscribe(user => this.updateUser(user));
    this.lambida.dataState$.subscribe(this.updateData.bind(this));
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.id) {
        this.setMember(params.id);
      }
    });
    // this.getLambida();
  }

  /**
   * called when new data was just loaded from the server by the lambida function.
   * So now I need to update the data I'm displaying.
   */
  updateData() {
    this.setMember(this.name);
  }

  onEditFriends() {
    console.log('edit friends');
    this.editModeFriends = !this.editModeFriends;
  }
  onAddFriend(friend) {
    console.log('adding friend: ' + friend);
  }

  onEdit() {
    this.openDialog();
  }
  openDialog() {
    const oldData: PlayerData = {
      name: this.name, team: this.player.getTeam(), winrate: this.player.getWinrate(),
        badges: this.player.getBadges(), medals: this.player.getMedals(), email: this.player.getEmail(),
        roles: this.player.getRoles(), code: this.player.getCode()
    };
    // console.log(data);

    const dialogRef = this.dialog.open(EditDialogComponent, {
      // height: 'fit-content',
      // width: '300px',
      data: oldData,
    });
    dialogRef.afterClosed().subscribe((newData: PlayerData) => {
      console.log('The dialog was closed');
      console.log(newData);
      if (newData) {
        this.player.setWinrate(newData.winrate);
        this.player.setBadges(newData.badges);
        this.player.setMedals(newData.medals);
        this.player.setTeam(newData.team);
        this.player.setEmail(newData.email);
        this.player.setRoles(newData.roles);
        this.player.setCode(newData.code);
        this.lambida.sendMemberUpdate(newData);
      }

      // this.animal = result;
    });
  }

  getLambida() {
    // this.lambida.updateLigaMembers();
    // const t2 = this.lambida.getAllMembers()
    //   .then(r => {
    //     console.log('server success: ');
    //     console.log(r);
    //     Liga.setAllPlayers(r.members);
    //   })
    //   .catch(r => {
    //     console.log('server error: ');
    //     console.log(r);
    //   });

    // console.log('t2');
    // console.log(t2);


  }

  updateUser(user: User) {
    this.user = user;
    this.checkOwner();
    // this.getLambida();
  }

  checkOwner() {
    this.rights = this.auth.canIeditPlayer(this.player);
    this.canIedit = this.rights.includes(Right.All) || this.rights.includes(Right.Personal);
    this.canIeditFriends = this.rights.includes(Right.All) || this.rights.includes(Right.Friends);
    // if (this.user && this.user.member === this.name) {
    //   console.log('YES! Logged in User is the owner of this account!');
    // } else {
    //   console.log('NO! Owner is not logged in!');
    // }
  }

  hasRight(right: string): boolean {
    return this.rights.includes(Right[right]);

  }

  changeFilter() {
    this.setMember(this.name);
  }

  setMember(member) {
    this.name = member;
    this.player = Liga.getPlayerByName(member);
    this.checkOwner();
    this.friends = this.player.getFriends();
    this.enemies = this.player.getEnemies();
    this.enemies = Liga.filterInscritos(this.enemies, this.filter);
    this.enemies = this.enemies.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.dia = Liga.filterPlayersByTier(this.enemies, Nivel.Diamante);
    this.dia = this.dia.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.rub = Liga.filterPlayersByTier(this.enemies, Nivel.Rubi);
    this.rub = this.rub.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.saf = Liga.filterPlayersByTier(this.enemies, Nivel.Safira);
    this.saf = this.saf.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.colleagues = this.player.getColleagues();
    this.colleagues = Liga.filterInscritos(this.colleagues, this.filter);
    this.colleagues = this.colleagues.sort((a, b) => b.getWinrate() - a.getWinrate());
    this.nonfriends = this.player.getNonFriends();
    this.nonfriends = Liga.filterInscritos(this.nonfriends, this.filter);
    this.nonfriends = this.nonfriends.sort((a, b) => b.getWinrate() - a.getWinrate());
  }
}
