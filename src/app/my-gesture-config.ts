import { Injectable } from '@angular/core';
import { GestureConfig, HammerManager } from '@angular/material';

@Injectable()
export class MyGestureConfig extends GestureConfig {
  buildHammer(element: HTMLElement) {
    const mc = super.buildHammer(element) as HammerManager;

    mc.set({ touchAction: 'pan-y' });

    // Your other configurations
    mc.get('swipe').set({ velocity: 0.3, threshold: 10 });

    return mc;
  }
}
