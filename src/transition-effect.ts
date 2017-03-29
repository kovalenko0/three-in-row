import { ticker } from 'pixi.js'
import { Task } from './sequencer'

export interface RenderNotifierObserver {
  subscribe(callback: (timeSinceStart: number) => void): {
    unsubscribe(): void
  }
}

export function createTransitionEffect(ticker: RenderNotifierObserver, callback: (timeSinceStart: number) => boolean): Task {
  return {
    execute() {
      return new Promise<void>(resolve => {
        const subscription = ticker.subscribe((timeSinceStart) => {
          const doStop = callback(timeSinceStart)

          if (doStop) {
            subscription.unsubscribe()
            resolve()
          }
        })
      })
    }
  }
}
