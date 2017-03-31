import { Store, createStore, Action } from 'redux'

export type AppStore = Store<AppState>

export interface AppState {
  fieldWidth: number
  fieldHeight: number
  frameIndex: number
  time: number
  moveTransitions: MoveTransition[]
  removeTransitions: RemoveTransition[]
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

export interface RemoveTransition extends Transition {

}

export type CellId = number

export type CellColor = 'a' | 'b'

export interface Cell {
  id: CellId
  x: number
  y: number
  color: CellColor
  inTransition: boolean
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
        state = createField(state)
        break
      }
      default: {
        break
      }
    }

    state.moveTransitions.forEach(t => setTransitionProgress(t, state.time))
    state.removeTransitions.forEach(t => setTransitionProgress(t, state.time))

    state = removeFinishedMoveTransitions(state)
    state = processFinishedRemoveTransitions(state)

    if (state.moveTransitions.length === 0 && state.removeTransitions.length === 0) {
      state = removeRandomCells(state)
    }

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

function createField(state: AppState) {
  for (let x = 0; x < state.fieldWidth; x++) {
    for (let y = 0; y < state.fieldHeight; y++) {
      const id = generateId()

      let delay = 0
      const itemsAnimationDelay = 20
      const reverseHorizontalDelay = y % 2
      const xDelayIncrement = reverseHorizontalDelay ? x : (state.fieldWidth - x)

      delay = (state.fieldHeight * (state.fieldHeight - y) + xDelayIncrement) * itemsAnimationDelay

      state.cells.push({
        color: Math.random() < 0.5 ? 'a' : 'b',
        id,
        x,
        y,
        inTransition: true
      })

      state.moveTransitions.push({
        target: id,
        duration: 300,
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

function setTransitionProgress(t: Transition, time: number) {
  t.progress = getTransitionProgress(t, time)
}

function removeFinishedMoveTransitions(state: AppState) {
  state.moveTransitions.forEach(t => {
    if (t.progress !== 1) {
      return
    }

    const target = findById(state.cells, t.target)

    if (target) {
      target.inTransition = false
    }
  })

  state.moveTransitions = state.moveTransitions.filter(t => t.progress !== 1)

  return state
}

function removeRandomCells(state: AppState) {
  if (state.cells.length === 0) {
    return state
  }

  const staticCells = state.cells.filter(c => !c.inTransition)
  const index = getRandomNumberInRange(0, staticCells.length - 3)
  const idsToRemove = [index, index + 1, index + 2].map((i) => staticCells[i].id)

  state.removeTransitions.push(...idsToRemove.map(id => {
    return {
      target: id,
      startTime: state.time,
      duration: 300
    }
  }))

  return state
}

function getRandomNumberInRange(from: number, to: number) {
  return from + Math.trunc((to - from) * Math.random())
}

function processFinishedRemoveTransitions(state: AppState) {
  const cellsToRemove = state
    .removeTransitions
    .filter(t => t.progress === 1)
    .map(t => findById(state.cells, t.target))


  cellsToRemove.forEach(cell => {
    if (cell) {
      state.cells.splice(state.cells.indexOf(cell), 1)
    }
  })

  state = cellsToRemove.reduce((state, cell, index) => {
    if (cell) {
      return createNewCellAt(state, cell.x, cell.y, index * 100)
    }
    return state
  }, state)

  state.removeTransitions = state.removeTransitions.filter(t => t.progress !==  1)

  return state
}

function createNewCellAt(state: AppState, x: number, y: number, delay: number) {
  const id = generateId()

  state.cells.push({
    color: Math.random() < 0.5 ? 'a' : 'b',
    id,
    x,
    y,
    inTransition: true
  })

  state.moveTransitions.push({
    target: id,
    duration: 300,
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

  return state
}
