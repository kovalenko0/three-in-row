/// <reference types="pixi.js" />
import { ticker } from 'pixi.js';
import { Task } from './sequencer';
export declare function createTransitionEffect(ticker: ticker.Ticker, callback: (timeSinceStart: number) => boolean): Task;
