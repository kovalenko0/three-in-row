/// <reference types="pixi.js" />
import { Graphics, WebGLRenderer, CanvasRenderer } from 'pixi.js';
import { RenderNotifierObserver } from './transition-effect';
export declare type Renderer = WebGLRenderer | CanvasRenderer;
export declare type CellColor = 'a' | 'b';
export interface GameState {
    field: {
        width: number;
        height: number;
        rows: Row[];
    };
}
export interface Row {
    cells: Cell[];
}
export interface Cell {
    offset: {
        x: number;
        y: number;
    };
    color: CellColor;
    view: Graphics;
}
export declare class RenderNotifier implements RenderNotifierObserver {
    private subscriptions;
    subscribe(callback: (time: number) => void): {
        unsubscribe: () => void;
    };
    notify(timePassed: number): void;
}
