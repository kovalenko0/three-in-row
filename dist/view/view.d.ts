import { AppState } from '../store/store';
export declare class View {
    private width;
    private height;
    private cellSize;
    private cellPadding;
    private colorA;
    private colorB;
    private offsetX;
    private offsetY;
    private renderer;
    private stage;
    private cellViews;
    constructor(element: HTMLElement, width: number, height: number, cellSize: number, cellPadding: number, colorA: number, colorB: number, offsetX?: number, offsetY?: number);
    render(state: AppState): void;
}
