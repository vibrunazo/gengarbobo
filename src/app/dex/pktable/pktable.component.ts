import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTable } from '@angular/material';
import { PktableDataSource, PktableItem } from './pktable-datasource';

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
  displayedColumns = ['dex', 'name', 'type', 'atk', 'def', 'hp', 'fm', 'cm'];

  ngOnInit() {
    this.dataSource = new PktableDataSource();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }
}
