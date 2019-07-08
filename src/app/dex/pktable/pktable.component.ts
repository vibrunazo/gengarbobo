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
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<PktableItem>;
  dataSource: PktableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['dex', 'name', 'type', 'atk', 'def', 'hp', 'stats', 'fm', 'cm'];

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
      html += thisMove.name + (i + 1 < moveIds.length ? ', ' : '');
    });
    return html;
  }
}
