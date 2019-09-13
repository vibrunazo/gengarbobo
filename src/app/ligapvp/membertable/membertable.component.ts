import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTable } from '@angular/material';
import { MembertableDataSource, MembertableItem } from './membertable-datasource';
import { LambidaService } from 'src/app/services/lambida.service';

@Component({
  selector: 'app-membertable',
  templateUrl: './membertable.component.html',
  styleUrls: ['./membertable.component.scss']
})
export class MembertableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<MembertableItem>;
  dataSource: MembertableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['team', 'name', 'badges', 'winrate', 'tier', 'friends'];

  ngOnInit() {
    this.dataSource = new MembertableDataSource();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
    this.lambida.dataState$.subscribe(this.updateDataSourceFromLambida.bind(this));
    // this.dataSource.buildTableItems();
  }

  constructor(private lambida: LambidaService) {

  }

  updateDataSourceFromLambida() {
    this.dataSource.buildTableItems();
  }
}
