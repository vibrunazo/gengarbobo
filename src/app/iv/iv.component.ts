import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-iv',
  templateUrl: './iv.component.html',
  styleUrls: ['./iv.component.scss']
})
export class IvComponent implements OnInit {
  name = 'Skarmory';
  league = 'Great';
  att = 15;
  def = 15;
  hp = 15;
  result = 'Result will show here.';

  constructor() {}

  ngOnInit() {}

  onSearch(form: NgForm) {
    if (form.value.name === '') {
      return;
    }
    this.result =
      'pokémon is: ' +
      form.value.name +
      ' with ' +
      form.value.att +
      '/' +
      form.value.def +
      '/' +
      form.value.hp +
      ' IVs.';
  }
}
