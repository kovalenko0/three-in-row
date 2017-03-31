import { Store, Action } from 'redux';
export declare type AppStore = Store<AppState>;
export interface AppState {
    frameIndex: number;
    time: number;
    moveTransitions: MoveTransition[];
    cells: Cell[];
}
export interface Transition {
    target: CellId;
    startTime: number;
    duration: number;
    progress?: number;
}
export interface MoveTransition extends Transition {
    from: MoveTransitionState;
    to: MoveTransitionState;
}
export interface MoveTransitionState {
    x: number;
    y: number;
}
export declare type CellId = number;
export declare type CellColor = 'a' | 'b';
export interface Cell {
    id: CellId;
    x: number;
    y: number;
    color: CellColor;
}
export declare type AppActionType = 'increase-time' | 'create-field';
export interface AppAction extends Action {
    type: AppActionType;
}
export interface IncreaseTime extends Action {
    type: 'increase-time';
    payload: number;
}
export interface CreateField extends Action {
    type: 'create-field';
    payload: {
        width: number;
        height: number;
    };
}
export declare function createAppStore(initialState: AppState): Store<AppState>;
