import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LambidaService } from 'src/app/services/lambida.service';
import { ServerLog } from 'functions/src/serverLog.model';
import { Liga, PlayerData } from 'src/app/shared/ligapvp.module';
import { Friendship } from 'functions/src/friends.model';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  authsub;
  user;
  myRoles: string[] = [];
  logs: ServerLog[] = [];
  logItems: LogItem[] = [];

  constructor(private auth: AuthService, private lambida: LambidaService) {
    this.authsub = auth.user$.subscribe(user => this.updateUser(user));
    this.lambida.dataState$.subscribe(this.updateData.bind(this));
  }

  ngOnInit() {
    this.myRoles = this.auth.getRoles();
    this.checkLogs();
  }
  updateUser(user) {
    this.user = user;
  }
  async updateData() {
    this.myRoles = this.auth.getRoles();
    this.checkLogs();
  }

  async checkLogs() {
    const response = await this.lambida.getLogs();
    this.logs = Object.values(response.logs);
    // this.logStrings = this.getStrings(this.logs);
    this.logItems = this.logs.map(l => this.readLogLine(l));
  }

  // getStrings(logs: ServerLog[]): string[] {
  //   const results: string[] = [];
  //   logs.forEach(l => {
  //     results.push(this.readLogLine(l));
  //   });
  //   return results;
  // }

  readLogLine(log: ServerLog): LogItem {
    const date: Date = new Date(log.date);
    let dateStr = date.toLocaleString();
    const day = dateStr.split(' ')[0].split('/').slice(0, 2).join('/');
    const time = dateStr.split(' ')[1].split(':').slice(0, 2).join(':');
    dateStr = `${day} ${time}`;
    let action = '';

    let msg = '';
    if (log.target === 'rtdb/friends') {
      const allFriends: string[] = Object.keys(log.body_new);
      const values: Friendship[] = Object.values(log.body_new);
      if (values[0].s) { action = 'ADD amizade'; } else { action = 'DEL amizade'; }
      const slice = allFriends.slice(0, 1);
      const leftCount = allFriends.length - slice.length;
      const left = leftCount ? `e ${leftCount} outros` : '';
      msg = `${Liga.getFriendsNames(slice[0])} ${left}`;
    }
    if (log.target && log.target.slice(0, 12) === 'fsdb/members') {
      const pName = log.target.slice(13);
      let m1;
      if (log.body_new) {
        const keys: string[] = Object.keys(log.body_new);
        const values: PlayerData[] = Object.values(log.body_new);
        const entries = Object.entries(log.body_new).toString().split(',').join(' ');
        m1 = `ADD ${entries}`;
      } else {
        const entries = Object.entries(log.body_old).toString().split(',').join(' ');
        m1 = `DEL ${entries}`;
      }
      action = `editou membro`;
      msg = `${pName} ${m1}`;

    }
    msg = `${action}: ${msg}`;
    const result: LogItem = {
      date: dateStr,
      author: log.author,
      msg,
    };
    // result = `${dateStr}: ${log.author} ${action}: ${msg}`;
    return result;
  }

  isAdmin(): boolean {
    if (this.myRoles.includes('admin') || this.myRoles.includes('site')) {
      return true;
    }
    return false;
  }
}

interface LogItem {
  date: string;
  author: string;
  msg: string;
}
