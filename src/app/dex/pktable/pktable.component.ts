import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTable } from '@angular/material';
import { PktableDataSource, PktableItem } from './pktable-datasource';
import { Move } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-pktable',
  templateUrl: './pktable.component.html',
  styleUrls: ['./pktable.component.scss']
})
export class PktableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<PktableItem>;
  dataSource: PktableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['dex', 'name', 'type', 'fm', 'cm', 'stats', 'atk', 'def', 'hp'];

  ngOnInit() {
    this.dataSource = new PktableDataSource();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  // returns the HTML to write in the cell for a fast or charged move. Given the array of move ids from that cell
  getMoveHTML(moveIds: string[]): string {
    let html = '';
    const moves: Move[] = [];
    moveIds.forEach((m, i) => {
      const thisMove = Move.findMoveById(m);
      moves.push(thisMove);
      html += `<span class="move ${thisMove.type}">${thisMove.name}</span>${i + 1 < moveIds.length ? ', ' : ''}`;
    });
    return html;
  }

  // returns the HTML for a cell in the 'types' column. Given an array of types
  getTypeHTML(types: string[]): string {
    let html = '';
    types.forEach((t, i) => {
      if (t !== 'none') {
        html += `${i === 1 ? ', ' : ''}<span class="move ${t}">${t}</span>`;
      }
    });

    return html;
  }
}
