import { AfterViewInit, Component, OnInit, ViewChild, Input, ViewEncapsulation, ElementRef } from '@angular/core';
import { MatPaginator, MatSort, MatTable, MatTooltipDefaultOptions, MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material';
import { TableDataSource, TableItem } from './table-datasource';
// import { Pokemon } from 'src/app/shared/shared.module';

/** Custom options the configure the tooltip's default show/hide delays. */
export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 500,
  hideDelay: 500,
  touchendHideDelay: 2000
};

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [{ provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults }],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  @ViewChild('lefoot', { static: false, read: ElementRef }) tbody: ElementRef;
  @Input() data: any[] = [];
  dataSource: TableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['rank', 'cp', 'level', 'iv', 'statprod', 'pct', 'bp', 'duel', 'wins', 'losses', 'sum', 'atk', 'def', 'hp'];
  fr: any = { r: 0, cp: 0, level: 0, iv: 0, statprod: 0, pct: 0, bp: 0, duel: 0, atk: 0, def: 0, hp: 0 };
  yourName: string;
  yourMove: string;

  ngOnInit() {
    this.dataSource = new TableDataSource(this.data);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;

    // console.log(this.tbody.nativeElement.textContent);
  }

  updateTable(data: any[], firstRow, yourName: string, yourMove: string) {
    this.data = data;
    this.fr = firstRow;
    this.yourName = yourName;
    this.yourMove = yourMove;
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

  getTooltip(col: string, row): string {
    if (!row.r) {
      return `Hover a table cell for more info.`;
    }

    switch (col) {
      case 'rank':
        return `This ${this.yourName} is the ${row.r}${nth(row.r)} best when ranked by Stats product.`;
        break;

      case 'cp':
        return `This ${this.yourName} has ${row.cp} max for this league.`;

      case 'level':
        return `This ${this.yourName} reaches its maximum cp of ${row.cp} at level ${row.level}.`;

      case 'iv':
        return `This ${this.yourName} has ${row.iv} Atk/Def/Hp IVs.`;

      case 'stats':
        return `This ${this.yourName} has ${row.stats} Stats Product.
        That's the multiplication of all stats: Atk x Def x Hp.
        The Stats Product is a way to represent how good the total of all stats are.
        In this website, we divide the Stats Product by 1000 for easier reading and also to match the same number used in PvPoke.com`;

      case 'pct':
        return `This ${this.yourName} has ${row.pct} of the Stats Product of the rank 1 ${this.yourName}.
        This represents how good the stats of this ${this.yourName} is in relation to the one with the highest possible stats.`;

      case 'bp':
        const bp = row.bp;
        const dealt = bp.split('-')[0];
        const taken = bp.split('-')[1];
        return `When your ${this.yourName} fights this ${this.yourName} using only ${this.yourMove},
        your ${this.yourMove} will deal ${dealt} damage to the enemy. And you will take ${taken} damage back from the enemy.`;

      case 'duel':
        const duel = row.duel;
        let duelwl = `WIN`;
        if (duel === 0) {
          duelwl = `DRAW`;
        }
        if (duel < 0) {
          duelwl = `LOSE`;
        }
        return `When your ${this.yourName} fights this ${this.yourName} using only ${this.yourMove},
        you will ${duelwl} the duel, and the winner ends up with ${duel} health left.`;

      case 'wins':
        return `This ${this.yourName} WINS ${row.wins} times against all other possible ${this.yourName}
            on duels using only ${this.yourMove}.`;

      case 'losses':
        return `This ${this.yourName} LOSES ${row.losses} times against all other possible ${this.yourName}
            on duels using only ${this.yourMove}.`;

      case 'sum':
        let sumwl = row.sum > 0 ? 'So it will WIN more often than it will lose.' : 'So it will LOSE more ofthan than it will win.';
        if (row.sum === 0) {
          sumwl = 'So it will win the same amount of times that it will lose.';
        }
        return `This ${this.yourName} has a SUM of WINS + LOSSES of ${row.sum}.
            ${sumwl}.`;

      case 'atk':
        return `This ${this.yourName} has a total of ${row.atk} Attack at level ${row.level}`;

      case 'def':
        return `This ${this.yourName} has a total of ${row.def} Defense at level ${row.level}`;

      case 'hp':
        return `This ${this.yourName} has a total of ${row.hp} Hit Points at level ${row.level}`;

      default:
        break;
    }
    return `Hover a table cell for more info.`;

    function nth(d) {
      if (d > 3 && d < 21) {
        return 'th';
      }
      switch (d % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    }
  }
}
