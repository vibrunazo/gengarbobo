import { Component, OnInit } from '@angular/core';
import { GitserviceService } from '../shared/gitservice.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  commitString = 'heh';
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
    const date = new Date(this.commitData[0].commit.committer.date);
    const now = new Date();
    const delta = now.getTime() - date.getTime();
    const diffDays = Math.floor(delta / (1000 * 60 * 60 * 24));
    console.log(date);
    this.commitString = `${date.toDateString()} (${diffDays} ${plural(diffDays)} ago)`;

    function plural(days) {
      return days === 1 ? 'day' : 'days';
    }

  }
}
