import { Store, createStore, Action } from 'redux'

export type AppStore = Store<AppState>

export interface AppState {
  frameIndex: number
  time: number
  moveTransitions: MoveTransition[]
  cells: Cell[]
}

export interface Transition {
  target: CellId
  startTime: number
  duration: number
  progress?: number
}

export interface MoveTransition extends Transition {
  from: MoveTransitionState
  to: MoveTransitionState
}

export interface MoveTransitionState {
  x: number
  y: number
}

export type CellId = number

export type CellColor = 'a' | 'b'

export interface Cell {
  id: CellId
  x: number
  y: number
  color: CellColor
}

export type AppActionType = 'increase-time' | 'create-field'

export interface AppAction extends Action {
  type: AppActionType
}

export interface IncreaseTime extends Action {
  type: 'increase-time'
  payload: number
}

export interface CreateField extends Action {
  type: 'create-field'
  payload: {
    width: number
    height: number
  }
}

const generateId = (() => {
  let id = 0
  return () => {
    id += 1
    return id
  }
})()

export function createAppStore(initialState: AppState) {
  return createStore<AppState>(function (state: AppState = initialState, action: AppAction) {
    switch (action.type) {
      case 'increase-time': {
        state.time += (action as IncreaseTime).payload

        break
      }
      case 'create-field': {
        const a = action as CreateField

        state = createField(state, a.payload.width, a.payload.height)
        break
      }
      default: {
        break
      }
    }

    state = removeFinishedTransitions(state)

    state.moveTransitions.forEach(t => {
      const target = findById(state.cells, t.target)

      if (!target) {
        return
      }

      t.progress = getTransitionProgress(t, state.time)
    })

    return state || initialState
  })
}

function getTransitionProgress(t: Transition, currentTime: number) {
  const isBeingAnimatedFor = currentTime - t.startTime

  if (isBeingAnimatedFor < 0) {
    return 0
  } else if (isBeingAnimatedFor > t.duration) {
    return 1
  } else {
    return isBeingAnimatedFor / t.duration
  }
}

function findById<ItemType extends { id: number }>(array: ItemType[], id: number) {
  return array.find(item => item.id === id)
}

function createField(state: AppState, width: number, height: number) {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < width; y++) {
      const id = generateId()

      let delay = 0
      const itemsAnimationDelay = 40
      const reverseHorizontalDelay = y % 2
      const xDelayIncrement = reverseHorizontalDelay ? x : (width - x)

      delay = (height * (height - y) + xDelayIncrement) * itemsAnimationDelay

      state.cells.push({
        color: Math.random() < 0.5 ? 'a' : 'b',
        id,
        x,
        y
      })

      state.moveTransitions.push({
        target: id,
        duration: 500,
        startTime: state.time + delay,
        from: {
          x: 0,
          y: - y - 1
        },
        to: {
          x: 0,
          y: 0
        }
      })
    }
  }

  return state
}

function removeFinishedTransitions(state: AppState) {
  state.moveTransitions = state.moveTransitions.filter(t => t.progress !== 1)

  return state
}
