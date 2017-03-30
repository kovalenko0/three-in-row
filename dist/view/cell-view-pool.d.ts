/// <reference types="pixi.js" />
import { Graphics } from 'pixi.js';
import { Cell, CellId, MoveTransitionState } from '../store/store';
export interface CellStyle {
    size: number;
    padding: number;
    colorA: number;
    colorB: number;
}
export declare class CellView {
    id: CellId;
    style: CellStyle;
    graphics: Graphics;
    private previousColor;
    constructor(id: CellId, style: CellStyle);
    setStyle(cellModel: Cell, transition: MoveTransitionState): void;
}
export declare class CellViewPool {
    private freeCells;
    getCell(id: CellId, style: CellStyle): CellView;
    freeCellView(cellView: CellView): void;
}
