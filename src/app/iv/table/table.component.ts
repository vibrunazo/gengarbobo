import { AfterViewInit, Component, OnInit, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTable } from '@angular/material';
import { TableDataSource, TableItem } from './table-datasource';
import { Pokemon } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  @Input() data: any[] = [];
  dataSource: TableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['rank', 'cp', 'level', 'iv', 'statprod', 'pct', 'bp', 'atk', 'def', 'hp'];
  fr = {rank: 0, cp: 0, level: 0, iv: 0, statprod: 0, pct: 0, bp: 0, atk: 0, def: 0, hp: 0};

  ngOnInit() {
    this.dataSource = new TableDataSource(this.data);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  updateTable(data: any[], firstRow, columnNames: any[]) {
    this.data = data;
    this.fr = firstRow;
    // this.dataSource.data = data;
    // this.dataSource.data.push(data[0]);
    this.dataSource.refresh(data);
    // this.table.renderRows();
    // this.dataSource.refresh();
    // console.log(data);
  }

  // get(pokemon: Pokemon, column: string): string {
  //   if (pokemon === undefined || pokemon.iv === undefined) { return; }
  //   if (column === 'iv') { return `${pokemon.iv.atk}/${pokemon.iv.def}/${pokemon.iv.hp}`; }
  //   if (column === 'statprod') { return `${Math.round(pokemon.statprod / 1000)}`; }
  //   if (column === '%') { return `${(100 * pokemon.statprod / this.max).toFixed(2)}%`; }
  //   return pokemon[column];
  // }
}
