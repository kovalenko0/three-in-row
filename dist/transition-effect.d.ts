import { Task } from './sequencer';
export interface RenderNotifierObserver {
    subscribe(callback: (timeSinceStart: number) => void): {
        unsubscribe(): void;
    };
}
export declare function createTransitionEffect(ticker: RenderNotifierObserver, callback: (timeSinceStart: number) => boolean): Task;
