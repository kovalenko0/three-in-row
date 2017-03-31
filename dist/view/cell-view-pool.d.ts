/// <reference types="pixi.js" />
import { Graphics, Container } from 'pixi.js';
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
    setStyle(cellModel: Cell, transition: MoveTransitionState, alpha: number): void;
}
export declare class CellViewPool {
    private stage;
    private freeCells;
    constructor(stage: Container);
    getCell(id: CellId, style: CellStyle): CellView;
    freeCellView(cellView: CellView): void;
}
