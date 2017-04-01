import { AppState } from '../store/store';
export declare class View {
    private width;
    private height;
    private cellSize;
    private cellPadding;
    private colorA;
    private colorB;
    private renderer;
    private cellViewPool;
    private viewsToRender;
    private stage;
    constructor(element: HTMLElement, width: number, height: number, cellSize: number, cellPadding: number, colorA: number, colorB: number);
    render(state: AppState): void;
}
