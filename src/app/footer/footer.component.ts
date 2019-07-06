import { Component, OnInit } from '@angular/core';
import { GitserviceService } from '../shared/gitservice.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  commitString = 'loading last commit';
  commitData;

  constructor(private gitService: GitserviceService) {}

  ngOnInit() {
    // https://api.github.com/repos/vibrunazo/gengarbobo/commits
    this.getCommits();
  }

  getCommits() {
    this.gitService.getGit().subscribe(data => {
      this.commitData = data;
      this.updateCommit();
    });
  }

  updateCommit() {
    console.log('logging commit');
    console.log(this.commitData);
    const date = new Date(this.commitData[0].commit.committer.date );
    // date.setDate(date.getDate() - 7);
    const now = new Date();
    const delta = now.getTime() - date.getTime();
    const diffHours = Math.floor(delta / (1000 * 60 * 60));

    if (diffHours < 24) {
      this.commitString = `${date.toDateString()} (${hoursAgo(diffHours)})`;
    }
    if (diffHours >= 24) {
      const diffDays = Math.floor(delta / (1000 * 60 * 60 * 24));
      this.commitString = `${date.toDateString()} (${daysAgo(diffDays)})`;
    }

    function hoursAgo(hours) {
      if (hours === 0) {
        return `just now`;
      }
      if (hours === 1) {
        return `1 hour ago`;
      }
      return `${hours} hours ago`;
    }
    function daysAgo(days) {
      if (days === 0) {
        return `today`;
      }
      if (days === 1) {
        return `1 day ago`;
      }
      return `${days} days ago`;
    }
  }
}
