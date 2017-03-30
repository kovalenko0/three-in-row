import {
  autoDetectRenderer,
  Container,
  WebGLRenderer,
  CanvasRenderer
} from 'pixi.js'

import {
  AppState,
  Transition,
  Cell,
  CellId
} from '../store/store'
import {
  CellViewPool,
  CellView,
  CellStyle
} from './cell-view-pool'

export class View {
  private renderer: WebGLRenderer | CanvasRenderer
  private cellViewPool = new CellViewPool()
  private viewsToRender: CellView[] = []
  private stage: Container

  constructor(
    element: HTMLElement,
    public cellSize = 40,
    public cellPadding = 1,
    public colorA = 0x36b9f7,
    public colorB = 0xec7777
  ) {
    this.renderer = autoDetectRenderer(400, 400)

    element.appendChild(this.renderer.view)

    this.stage = new Container()
  }

  public render(state: AppState) {
    const viewsToRender = state.cells.map((cell, index) => {
      const existingView = findById(this.viewsToRender, cell.id)

      if (existingView) {
        return existingView
      }

      // TODO: pool could return existing busy view by id
      const cellView = this.cellViewPool.getCell(
        cell.id,
        {
          colorA: this.colorA,
          colorB: this.colorB,
          size: this.cellSize,
          padding: this.cellPadding
        })

      this.stage.addChild(cellView.graphics)

      return cellView
    })

    this.viewsToRender.forEach(view => {
      if (!findById(viewsToRender, view.id)) {
        this.cellViewPool.freeCellView(view)
      }
    })

    this.viewsToRender = viewsToRender

    this.viewsToRender.forEach(view => {
      const cellModel = findById(state.cells, view.id)

      if (!cellModel) {
        return
      }

      const transition = findTransition(state, view.id)

      if (!transition) {
        view.setStyle(cellModel, {
          x: 0,
          y: 0
        })
        return
      }

      view.setStyle(cellModel, transition.currentState)
    })

    this.renderer.render(this.stage)
  }
}

function findById<ItemType extends { id: number }>(array: ItemType[], id: number) {
  return array.find(item => item.id === id)
}

function findTransition(state: AppState, target: CellId) {
  return state.transitions.find(t => t.target === target)
}
