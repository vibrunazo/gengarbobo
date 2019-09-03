import { Component, OnInit } from '@angular/core';
import { GitserviceService } from '../shared/gitservice.service';
import { LambdaService } from '../shared/lambda.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  commitDate = 'loading last commit';
  commitMessage = '...';
  commitData;

  constructor(private gitService: GitserviceService, private lambdaService: LambdaService) {}

  ngOnInit() {
    // https://api.github.com/repos/vibrunazo/gengarbobo/commits
    this.getCommits();
  }

  getCommits() {
    this.gitService.getGit().subscribe(data => {
      this.commitData = data;
      this.updateCommit();
    });
    const lresult = this.lambdaService.runTest1().subscribe(data => {
      console.log('data');
      console.log(data);

    });
    console.log('lresult');
    // console.log(lresult);

  }

  updateCommit() {
    // console.log('logging commit');
    // console.log(this.commitData);
    const date = new Date(this.commitData[0].commit.committer.date );
    // date.setDate(date.getDate() - 7);
    const now = new Date();
    const delta = now.getTime() - date.getTime();
    const diffHours = Math.floor(delta / (1000 * 60 * 60));


    if (diffHours < 24) {
      this.commitDate = `${date.toDateString()} (${hoursAgo(diffHours)})`;
    }
    if (diffHours >= 24) {
      const diffDays = Math.floor(delta / (1000 * 60 * 60 * 24));
      this.commitDate = `${date.toDateString()} (${daysAgo(diffDays)})`;
    }

    const msg = this.commitData[0].commit.message;
    this.commitMessage = msg;

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
