export interface Task {
  execute(): Promise<void>
}

export function createSequencedExecutor(tasks: Task[]): Task {
  return {
    execute() {
      return tasks.reduce((chain, task) => {
        return chain.then(() => task.execute())
      }, Promise.resolve())
    }
  }
}

export function createParallelExecutor(tasks: Task[]): Task {
  return {
    execute() {
      return Promise.all(tasks.map(task => task.execute())).then(() => {})
    }
  }
}
