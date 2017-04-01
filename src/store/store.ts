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
        // state = createField(state)
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
    state = fillEmptySpace(state)

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
    if (isBeingAnimatedFor / t.duration > 1) {
      console.log('Having some weird shit going on')
    }
    return isBeingAnimatedFor / t.duration
  }
}

function findById<ItemType extends { id: number }>(array: ItemType[], id: number) {
  return array.find(item => item.id === id)
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
  const cellsToRemove = [index, index + 1, index + 2].map((i) => staticCells[i])

  state.removeTransitions.push(...cellsToRemove.map(cell => {
    return {
      target: cell.id,
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

  const affectedCells = new Map<CellId, MoveTransitionState>()

  cellsToRemove.forEach(cell => {
    if (!cell) {
      return
    }
    const cellsAbove = state.cells.filter(c => c.x === cell.x && c.y < cell.y)

    cellsAbove.forEach(c => {
      c.y += 1

      let affectedCell = affectedCells.get(c.id)

      if (!affectedCell) {
        affectedCell = {
          x: 0,
          y: 0
        }
        affectedCells.set(c.id, affectedCell)
      }

      affectedCell.y -= 1
    })
  })

  for (const [id, offset] of affectedCells) {
    const isGoingToBeRemoved = cellsToRemove.indexOf(findById(state.cells, id)) !== -1

    if (isGoingToBeRemoved) {
      continue
    }

    state.moveTransitions.push({
      target: id,
      duration: 500,
      startTime: state.time,
      from: offset,
      to: {
        x: 0,
        y: 0
      }
    })
  }

  cellsToRemove.forEach(cell => {
    if (cell) {
      state.cells.splice(state.cells.indexOf(cell), 1)
    }
  })

  state.removeTransitions = state.removeTransitions.filter(t => t.progress !== 1)

  return state
}

function fillEmptySpace(state: AppState) {
  let createdCellCount = 0

  for (let x = 0; x < state.fieldWidth; x++) {
    for (let y = 0; y < state.fieldHeight; y++) {
      const existingCell = state.cells.find(c => c.x === x && c.y === y)

      if (!existingCell) {
        state = createNewCellAt(state, x, y, 0)
      }
    }
  }

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

  return state
}
