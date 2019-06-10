import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge, BehaviorSubject } from 'rxjs';
import { Pokemon } from 'src/app/shared/shared.module';

// TODO: Replace this with your own data model type
export interface TableItem {
  level: number;
  cp: number;
  first?: boolean;
}

/**
 * Data source for the Table view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class TableDataSource extends DataSource<TableItem> {
  // data: TableItem[] = EXAMPLE_DATA;
  // data: Pokemon[];
  paginator: MatPaginator;
  sort: MatSort;
  dataStream = new BehaviorSubject<TableItem[]>([]);

  set data(v: TableItem[]) { this.dataStream.next(v); }
  get data(): TableItem[] { return this.dataStream.value; }


  constructor(data: TableItem[]) {
    super();
    this.data = data;
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<TableItem[]> {
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

  refresh(newData: TableItem[]) {
    this.data = newData;
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
  private getPagedData(data: TableItem[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: TableItem[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      if (a.first) { return -1; }
      if (b.first) { return 1; }
      const isAsc = this.sort.direction === 'asc';
      return compare(+a[this.sort.active], +b[this.sort.active], isAsc);
      // switch (this.sort.active) {
        // case 'name': return compare(a.species.speciesName, b.species.speciesName, isAsc);
        // case 'iv': return compare(+a.iv.atk, +b.iv.atk, isAsc);
        // case 'cp': return compare(+a.cp, +b.cp, isAsc);
        // case 'level': return compare(+a.level, +b.level, isAsc);
        // case 'stats': return compare(+a.statprod, +b.statprod, isAsc);
        // case '%': return compare(+a.statprod, +b.statprod, isAsc);
        // default: return 0;
      // }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
