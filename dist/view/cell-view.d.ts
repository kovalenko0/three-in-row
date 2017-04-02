/// <reference types="pixi.js" />
import { Graphics } from 'pixi.js';
import { Cell, MoveTransitionState } from '../store/store';
export interface CellStyle {
    size: number;
    padding: number;
    colorA: number;
    colorB: number;
}
export declare class CellView {
    id: number;
    style: CellStyle;
    graphics: Graphics;
    private previousColor;
    constructor(id: number, style: CellStyle);
    setStyle(cellModel: Cell, transition: MoveTransitionState, alpha: number): void;
}
