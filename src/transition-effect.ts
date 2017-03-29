import { ticker } from 'pixi.js'
import { Task } from './sequencer'

export function createTransitionEffect(ticker: ticker.Ticker, callback: (timeSinceStart: number) => boolean): Task {
  return {
    execute() {
      return new Promise<void>(resolve => {
        let timeSinceStart = 0

        const trigger = () => {
          timeSinceStart += ticker.elapsedMS

          const doStop = callback(timeSinceStart)

          if (doStop) {
            ticker.remove(trigger)
            resolve()
          }
        }

        ticker.add(trigger)
      })
    }
  }
}
