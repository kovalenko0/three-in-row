import { createAppStore, AppState } from './store/store'
import { View } from './view/view'
import { ticker } from 'pixi.js'

const initialState: AppState = {
  frameIndex: 0,
  time: 0,
  transitions: [
    // {
    //   duration: 500,
    //   startTime: 0,
    //   target: 12,
    //   options: {
    //     type: 'move',
    //     from: {
    //       x: -1,
    //       y: 0
    //     },
    //     to: {
    //       x: 0,
    //       y: 3
    //     }
    //   },
    //   currentState: {
    //     x: 0,
    //     y: 0
    //   },
    // }
  ],
  cells: [

  ]
}

const store = createAppStore(initialState)
const element = document.querySelector('#stage') as HTMLElement

if (!element) {
  throw 'Stage element is not present'
}

const view = new View(
  element,
  40,
  1,
  0x36b9f7,
  0xec7777
)

store.subscribe(() => view.render(store.getState()))

store.dispatch({
  type: 'create-field',
  payload: {
    width: 10,
    height: 10
  }
})

ticker.shared.add((deltaTime: number) => {
  store.dispatch({
    type: 'increase-time',
    payload: ticker.shared.elapsedMS
  })
})
