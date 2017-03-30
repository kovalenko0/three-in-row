import { AppState } from '../store/store';
export declare class View {
    cellSize: number;
    cellPadding: number;
    colorA: number;
    colorB: number;
    private renderer;
    private cellViewPool;
    private viewsToRender;
    private stage;
    constructor(element: HTMLElement, cellSize?: number, cellPadding?: number, colorA?: number, colorB?: number);
    render(state: AppState): void;
}
