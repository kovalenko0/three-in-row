import {
  autoDetectRenderer,
  Container,
  Graphics,
  WebGLRenderer,
  CanvasRenderer
} from 'pixi.js'

type Renderer = WebGLRenderer | CanvasRenderer

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
  color: CellColor
}

const renderer = autoDetectRenderer(400, 400)

document.querySelector('#stage').appendChild(renderer.view)

const stage = new Container()
const graphics = new Graphics()

const state = buildInitialState(10, 10)

renderGateState(graphics, state)

stage.addChild(graphics)

renderer.render(stage)

function buildInitialState(fieldWith: number, fieldHeight: number): GameState {
  return {
    field: {
      width: fieldWith,
      height: fieldHeight,
      rows: createArrayOfLength(fieldHeight, rowIndex => {
        return {
          cells: createArrayOfLength(fieldHeight, cellIndex => {
            return {
              color: getRandomCellColor()
            }
          })
        }
      })
    }
  }
}

function createArrayOfLength<ItemType>(length: number, creator: (index: number) => ItemType) {
  return Array.from(new Array(length)).map(index => creator(index))
}

function getRandomCellColor(): CellColor {
  return Math.random() < 0.5 ? 'a' : 'b'
}

function renderGateState(graphics: Graphics, state: GameState) {
  const cellSize = 40
  const padding = 1
  const colorA = 0x36b9f7
  const colorB = 0xec7777

  iterateCells(state.field.rows, (x, y, cell) => {
    let color

    switch (cell.color) {
      case 'a': {
        color = colorA
        break
      }
      case 'b': {
        color = colorB
      }
      default: {

      }
    }

    graphics.beginFill(color)
    graphics.drawRect(
      x * cellSize + padding,
      y * cellSize + padding,
      cellSize - padding * 2,
      cellSize - padding * 2
    )
    graphics.endFill()
  })
}

function iterateCells(rows: Row[], callback: (x: number, y: number, cell: Cell) => void) {
  rows.forEach((r, rowIndex) => r.cells.forEach((c, cellIndex) => callback(cellIndex, rowIndex, c)))
}
