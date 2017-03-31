import { createAppStore, AppState } from './store/store'
import { View } from './view/view'
import { ticker } from 'pixi.js'

const initialState: AppState = {
  fieldWidth: 7,
  fieldHeight: 7,
  frameIndex: 0,
  time: 0,
  moveTransitions: [],
  removeTransitions: [],
  cells: []
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
    width: 4,
    height: 4
  }
})

ticker.shared.add((deltaTime: number) => {
  store.dispatch({
    type: 'increase-time',
    payload: ticker.shared.elapsedMS
  })
})
