import { createAppStore, AppState } from './store/store'
import { View } from './view/view'
import { ticker } from 'pixi.js'

const initialState: AppState = {
  fieldWidth: 10,
  fieldHeight: 10,
  lineLength: 3,
  transitionDuration: 300,
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
  400,
  400,
  40,
  1,
  0x36b9f7,
  0xec7777
)

store.subscribe(() => view.render(store.getState()))

ticker.shared.add(() => {
  store.dispatch({
    type: 'increase-time',
    payload: ticker.shared.elapsedMS
  })
})
