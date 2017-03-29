export interface Task {
    execute(): Promise<void>;
}
export declare function createSequencedExecutor(tasks: Task[]): Task;
export declare function createParallelExecutor(tasks: Task[]): Task;
export declare function delay(time: number): Task;
