/// <reference types="pixi.js" />
import { WebGLRenderer, CanvasRenderer } from 'pixi.js';
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
}
