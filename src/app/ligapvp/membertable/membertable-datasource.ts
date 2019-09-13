import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge, BehaviorSubject } from 'rxjs';
import { Liga } from 'src/app/shared/ligapvp.module';

// TODO: Replace this with your own data model type
export interface MembertableItem {
  name: string;
  team: string;
  winrate: number;
  tier: string;
  friends: number;
  badges: number;
  medals: number;
}

/**
 * Data source for the Membertable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class MembertableDataSource extends DataSource<MembertableItem> {
  // data: MembertableItem[] = [];
  dataStream = new BehaviorSubject<MembertableItem[]>(null);
  set data(v: MembertableItem[]) { this.dataStream.next(v); }
  get data(): MembertableItem[] { return this.dataStream.value; }
  paginator: MatPaginator;
  sort: MatSort;

  constructor() {
    super();
    this.buildTableItems();
  }

  /**
   * Builds the actual data in the table.
   * Called by the parent component: membertable.component
   */
  buildTableItems() {
    const all = Liga.getAllPlayers();
    let newData: MembertableItem[] = [];
    all.forEach(p => {
      const row: MembertableItem = {
        name: p.getName(),
        team: p.getTeamIcon(),
        winrate: p.getWinrate(),
        tier: p.getTierIcon(),
        friends: p.getFriends().length,
        badges: p.getBadges() || 0,
        medals: p.getMedals() || 0,
      };
      newData.push(row);
    });
    newData = newData.sort((a, b) => (b.winrate + b.badges * 100) - (a.winrate + a.badges * 100));
    this.data = newData;
    // console.log('updated table');
    // console.log(Liga.getPlayerByName('vib'));
    // console.log(Liga.getAllPlayers());

  }


  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<MembertableItem[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      // observableOf(this.data),
      this.dataStream,
      this.paginator.page,
      this.sort.sortChange
    ];

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: MembertableItem[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: MembertableItem[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      return compare(a[this.sort.active], b[this.sort.active], isAsc);
      // switch (this.sort.active) {
      //   case 'name': return compare(a.name, b.name, isAsc);
      //   case 'id': return compare(+a.id, +b.id, isAsc);
      //   default: return 0;
      // }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
