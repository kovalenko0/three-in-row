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
    color: CellColor;
}
