// TODO: deal with magic numbers

import {
  autoDetectRenderer,
  Container,
  Graphics,
  WebGLRenderer,
  CanvasRenderer,
  ticker
} from 'pixi.js'
import { createTransitionEffect, RenderNotifierObserver } from './transition-effect'
import { createParallelExecutor, createSequencedExecutor, delay } from './sequencer'

export type Renderer = WebGLRenderer | CanvasRenderer

export type CellColor = 'a' | 'b'

export interface GameState {
  field: {
    width: number
    height: number
    rows: Row[]
  }
}

export interface Row {
  cells: Cell[]
}

export interface Cell {
  offset: {
    x: number
    y: number
  }
  color: CellColor
  view: Graphics
}

export class RenderNotifier implements RenderNotifierObserver {
  private subscriptions: ((time: number) => void)[] = []
  public subscribe(callback: (time: number) => void) {
    this.subscriptions.push(callback)

    return {
      unsubscribe: () => {
        const callbackIndex = this.subscriptions.indexOf(callback)
        this.subscriptions.splice(callbackIndex, 1)
      }
    }
  }
  public notify(timePassed: number) {
    this.subscriptions.slice().forEach(s => s(timePassed))
  }
}

const renderer = autoDetectRenderer(400, 400)

document.querySelector('#stage').appendChild(renderer.view)

const stage = new Container()
const state = buildInitialState(10, 10)

iterateCells(state.field.rows, (x, y, cell) => stage.addChild(cell.view))

const mainTicker = new ticker.Ticker()

const renderNotifier = new RenderNotifier()


const render = () => {
  renderNotifier.notify(mainTicker.elapsedMS)
  updateCellPositions(state)
  renderer.render(stage)
}

mainTicker.add(render)

function moveOffsetCells(state: GameState) {
  const entryTransitions = mapCells(state.field.rows, (x, y, cell) => {
    const transitionDuration = 500
    const itemsAnimationDelay = 40
    const initialOffset = cell.offset.y
    const targetOffset = 0

    let timePassed = 0

    const transitionEffect = createTransitionEffect(renderNotifier, (timeDelta) => {
      timePassed += timeDelta

      const progress = timePassed / transitionDuration
      cell.offset.y = transitionValue(initialOffset, targetOffset, progress)

      return progress >= 1
    })

    const reverseHorizontalDelay = y % 2
    const xDelayIncrement = reverseHorizontalDelay ? x : (state.field.width - x)

    return createSequencedExecutor([
      delay((state.field.height * (state.field.height - y) + xDelayIncrement) * itemsAnimationDelay),
      transitionEffect
    ])
  })

  return createParallelExecutor(entryTransitions)
    .execute()
    .then(() => {
      mainTicker.remove(render)
      render()

      console.log('initial animation finished')
    })
}

moveOffsetCells(state)

mainTicker.start()

function buildInitialState(fieldWidth: number, fieldHeight: number): GameState {
  const cellSize = 40
  const cellInitialOffset = - fieldHeight * cellSize
  const padding = 1
  const colorA = 0x36b9f7
  const colorB = 0xec7777

  return {
    field: {
      width: fieldWidth,
      height: fieldHeight,
      rows: createArrayOfLength(fieldHeight, rowIndex => {
        return {
          cells: createArrayOfLength(fieldWidth, cellIndex => {
            const graphics = new Graphics()
            const color = getRandomCellColor()
            let hexColor

            switch (color) {
              case 'a': {
                hexColor = colorA
                break
              }
              case 'b': {
                hexColor = colorB
              }
              default: {

              }
            }

            graphics.beginFill(hexColor)
            graphics.drawRect(
              0, 0,
              cellSize - padding * 2,
              cellSize - padding * 2
            )
            graphics.endFill()

            return {
              offset: {
                x: 0,
                y: cellInitialOffset
              },
              color,
              view: graphics
            }
          })
        }
      })
    }
  }
}

function createArrayOfLength<ItemType>(length: number, creator: (index: number) => ItemType) {
  return Array.from(new Array(length)).map((item, index) => creator(index))
}

function getRandomCellColor(): CellColor {
  return Math.random() < 0.5 ? 'a' : 'b'
}

function updateCellPositions(state: GameState) {
  const cellSize = 40
  const padding = 1

  iterateCells(state.field.rows, (x, y, cell) => {
    cell.view.x = x * cellSize + padding + cell.offset.x
    cell.view.y = y * cellSize + padding + cell.offset.y
  })
}

function iterateCells(rows: Row[], callback: (x: number, y: number, cell: Cell) => void) {
  rows.forEach((r, rowIndex) => r.cells.forEach((c, cellIndex) => callback(cellIndex, rowIndex, c)))
}

function mapCells<ItemType>(rows: Row[], callback: (x: number, y: number, cell: Cell) => ItemType) {
  const result: ItemType[] = []

  iterateCells(rows, (x, y, cell) => {
    result.push(callback(x, y, cell))
  })

  return result
}

function transitionValue(from: number, to: number, progress: number) {
  const delta = to - from
  const result = from + delta * progress

  return result > to ? to : result
}
