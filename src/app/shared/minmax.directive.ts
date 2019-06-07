import { Attribute, Directive, forwardRef, Input, OnChanges, SimpleChanges, Provider, NgModule } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, FormControl } from '@angular/forms';

export const MIN_VALUE_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => MinValueValidator),
  multi: true
};

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[min][formControlName],[min][formControl],[min][ngModel]',
  providers: [MIN_VALUE_VALIDATOR],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[attr.min]': 'min ? min : 0' }
})
export class MinValueValidator implements Validator, OnChanges {
  constructor(@Attribute('min') mn: string) {
    if (mn !== undefined && mn !== null) {
      // isPresent
      const attrValue = parseInt(mn, 10);
      if (!isNaN(attrValue)) {
        this.min = mn;
        this._createValidator();
      }
    }
  }
  // tslint:disable-next-line: variable-name
  private _validator: ValidatorFn;

  @Input() min: string;

  static min(mn: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const v = +control.value;
      return v < mn ? { min: { minValue: mn, actualValue: v } } : null;
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    const minChange = changes.min;
    if (minChange) {
      this._createValidator();
    }
  }

  private _createValidator() {
    this._validator = MinValueValidator.min(parseInt(this.min, 10));
  }

  validate(c: AbstractControl): { [key: string]: any } {
    return this._validator(c);
  }
}

export const MAX_VALUE_VALIDATOR: any = {
  provide: NG_VALIDATORS,
// tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => MaxValueValidator),
  multi: true
};

@Directive({
// tslint:disable-next-line: directive-selector
  selector: '[max][formControlName],[min][formControl],[min][ngModel]',
  providers: [MAX_VALUE_VALIDATOR],
// tslint:disable-next-line: no-host-metadata-property
  host: { '[attr.max]': 'max ? max : 0' }
})
export class MaxValueValidator implements Validator, OnChanges {

  constructor(@Attribute('max') mx: string) {
    if (mx !== undefined && mx !== null) {
      // isPresent
      const attrValue = parseInt(mx, 10);
      if (!isNaN(attrValue)) {
        this.max = mx;
        this._createValidator();
      }
    }
  }
// tslint:disable-next-line: variable-name
  private _validator: ValidatorFn;

  @Input() max: string;

  static max(mx: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const v = +control.value;
      return v > mx ? { max: { maxValue: mx, actualValue: v } } : null;
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    const maxChange = changes.max;
    if (maxChange) {
      this._createValidator();
    }
  }

  private _createValidator() {
    this._validator = MaxValueValidator.max(parseInt(this.max, 10));
  }

  validate(c: AbstractControl): { [key: string]: any } {
    return this._validator(c);
  }
}
