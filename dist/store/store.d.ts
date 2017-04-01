import { Store, Action } from 'redux';
export declare type AppStore = Store<AppState>;
export interface AppState {
    fieldWidth: number;
    fieldHeight: number;
    lineLength: number;
    time: number;
    moveTransitions: MoveTransition[];
    removeTransitions: RemoveTransition[];
    cells: Cell[];
}
export interface Transition {
    target: CellId;
    startTime: number;
    duration: number;
    progress: number;
}
export interface MoveTransition extends Transition {
    from: MoveTransitionState;
    to: MoveTransitionState;
}
export interface MoveTransitionState {
    x: number;
    y: number;
}
export interface RemoveTransition extends Transition {
}
export declare type CellId = number;
export declare type CellColor = 'a' | 'b';
export interface Cell {
    id: CellId;
    x: number;
    y: number;
    color: CellColor;
    inTransition: boolean;
}
export declare type AppActionType = 'increase-time';
export interface AppAction extends Action {
    type: AppActionType;
    payload: number;
}
export declare function createAppStore(initialState: AppState): Store<AppState>;
