import { Store, createStore, Action } from 'redux'

export type AppStore = Store<AppState>

export interface AppState {
  fieldWidth: number
  fieldHeight: number
  lineLength: number
  time: number
  transitionDuration: number
  moveTransitions: {
    [cellId: number]: MoveTransition
  }
  removeTransitions: {
    [cellId: number]: RemoveTransition
  }
  cells: Cell[]
}

export interface Transition {
  startTime: number
  duration: number
  progress: number
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

export type CellColor = 'a' | 'b'

export interface Cell {
  id: number
  x: number
  y: number
  color: CellColor
  inTransition: boolean
}

export type AppActionType = 'increase-time'

export interface AppAction extends Action {
  type: AppActionType,
  payload: number
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
        state.time += action.payload
        break
      }
      default: {
        break
      }
    }

    iterateProps(state.moveTransitions, (transition) => {
      setTransitionProgress(transition, state.time)
    })

    iterateProps(state.removeTransitions, (transition) => {
      setTransitionProgress(transition, state.time)
    })

    state = removeFinishedMoveTransitions(state)
    state = processFinishedRemoveTransitions(state)

    if (state.cells.length === 0) {
      state = generateField(state)
    }

    if (getPropsCount(state.moveTransitions) === 0 && getPropsCount(state.removeTransitions) === 0) {
      state = removeLineOfCells(state)
    }

    return state || initialState
  })
}

function setTransitionProgress(t: Transition, time: number) {
  t.progress = getTransitionProgress(t, time)
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

function removeFinishedMoveTransitions(state: AppState) {
  iterateProps(state.moveTransitions, (t, targetId) => {
    if (t.progress !== 1) {
      return
    }

    const target = findById(state.cells, targetId)

    if (target) {
      target.inTransition = false
    }

    if (t.progress === 1) {
      delete state.moveTransitions[+targetId]
    }
  })

  return state
}

function findById<ItemType extends { id: number }>(array: ItemType[], id: number) {
  return array.find(item => item.id === id)
}

function processFinishedRemoveTransitions(state: AppState) {
  const cellsToRemove: Cell[] = []

  iterateProps(state.removeTransitions, (t, targetId) => {
    if (t.progress === 1) {
      cellsToRemove.push(findById(state.cells, +targetId) as Cell)

      delete state.removeTransitions[+targetId]
    }
  })

  const affectedCells = new Map<number, MoveTransitionState>()

  sortBy(cellsToRemove, 'y')
    .forEach(cell => {
      const cellsAbove = state.cells.filter(c => c.x === cell.x && c.y < cell.y)

      cell.color = getRandomCellColor()
      cell.y = -1
      cellsAbove.push(cell)

      cellsAbove.forEach(c => {
        let offset = affectedCells.get(c.id)

        if (!offset) {
          offset = {
            x: 0,
            y: 0
          }
          affectedCells.set(c.id, offset)
        }

        offset.y -= 1
        c.y += 1
      })
    })

  for (const [id, offset] of affectedCells) {
    state.moveTransitions[id] = {
      startTime: state.time,
      duration: state.transitionDuration,
      progress: 0,
      from: offset,
      to: {
        x: 0,
        y: 0
      }
    }
  }

  return state
}

function removeLineOfCells(state: AppState) {
  /* tslint:disable:switch-default */
  switch (getRandomBoolean()) {
    case true:
      const columnOfCellToRemove = findColumnToRemove(state)

      if (columnOfCellToRemove.length > 0) {
        return removeCells(state, columnOfCellToRemove)
      }
    case false:
      return removeCells(state, findRowToRemove(state))
  }
}

function findRowToRemove(state: AppState): Cell[] {
  return findLineToRemove(state, extractRows(state))
}

function findColumnToRemove(state: AppState): Cell[] {
  return findLineToRemove(state, extractColumns(state))
}

function findLineToRemove(state: AppState, cellCollections: Cell[][]) {
  for (let collection of cellCollections) {
    let previousColor: CellColor | null = null
    let currentLine: Cell[] = []

    for (let cell of collection) {
      if (cell.color === previousColor) {
        currentLine.push(cell)
      } else {
        if (currentLine.length >= state.lineLength) {
          break
        }
        previousColor = cell.color
        currentLine = [cell]
      }
    }

    if (currentLine.length >= state.lineLength) {
      return currentLine
    }
  }

  return []
}

function removeCells(state: AppState, cellsToRemove: Cell[]) {
  if (state.cells.length === 0) {
    return state
  }

  cellsToRemove.forEach(cell => {
    state.removeTransitions[cell.id] = {
      startTime: state.time,
      duration: state.transitionDuration,
      progress: 0
    }
  })

  return state
}

function extractRows(state: AppState) {
  const rows = []

  for (let i = 0; i < state.fieldHeight; i++) {
    const row = state.cells.filter(c => c.y === i && !c.inTransition)
    const sortedRow = sortBy(row, 'x')
    rows.push(sortedRow)
  }

  return rows
}

function extractColumns(state: AppState) {
  const columns = []

  for (let i = 0; i < state.fieldWidth; i++) {
    const column = state.cells.filter(c => c.x === i && !c.inTransition)
    const sortedRow = sortBy(column, 'y')
    columns.push(sortedRow)
  }

  return columns
}

function generateField(state: AppState) {
  for (let x = 0; x < state.fieldWidth; x++) {
    for (let y = 0; y < state.fieldHeight; y++) {
      const existingCell = state.cells.find(c => c.x === x && c.y === y)

      let delay = 0
      const itemsAnimationDelay = 20
      const reverseHorizontalDelay = y % 2
      const xDelayIncrement = reverseHorizontalDelay ? x : (state.fieldWidth - x)

      delay = (state.fieldHeight * (state.fieldHeight - y) + xDelayIncrement) * itemsAnimationDelay

      if (!existingCell) {
        state = createNewCellAt(state, x, y, delay)
      }
    }
  }

  return state
}

function createNewCellAt(state: AppState, x: number, y: number, delay: number) {
  const id = generateId()

  state.cells.push({
    color: getRandomCellColor(),
    id,
    x,
    y,
    inTransition: true
  })

  state.moveTransitions[id] = {
    startTime: state.time + delay,
    duration: state.transitionDuration,
    progress: 0,
    from: {
      x: 0,
      y: - y - 1
    },
    to: {
      x: 0,
      y: 0
    }
  }

  return state
}

function getRandomCellColor() {
  return Math.random() < 0.5 ? 'a' : 'b'
}

interface Map<ValueType> {
  [key: number]: ValueType
}

function iterateProps<ValueType>(map: Map<ValueType>, callback: (value: ValueType, key: number) => void) {
  Object
    .keys(map)
    .forEach(key => callback(map[+key], +key))
}

function getPropsCount(object: any) {
  return Object.keys(object).length
}

interface Indexable {
  [key: number]: any,
  [key: string]: any
}

function sortBy<ItemType>(array: ItemType[], propertyName: string | number) {
  return array.sort((a, b) => {
    const valueA = (a as Indexable)[propertyName]
    const valueB = (b as Indexable)[propertyName]

    if (valueA < valueB) {
      return 1
    } else if (valueA > valueB) {
      return -1
    } else {
      return 0
    }
  })
}

function getRandomBoolean() {
  return Math.random() > 0.5
}
