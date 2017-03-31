import {
  autoDetectRenderer,
  Container,
  WebGLRenderer,
  CanvasRenderer
} from 'pixi.js'

import {
  AppState,
  MoveTransition,
  RemoveTransition,
  CellId
} from '../store/store'

import {
  CellViewPool,
  CellView
} from './cell-view-pool'

export class View {
  private renderer: WebGLRenderer | CanvasRenderer
  private cellViewPool: CellViewPool
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
    this.cellViewPool = new CellViewPool(this.stage)
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
        throw 'No cell model associated with view'
      }

      const moveTransition = findMoveTransition(state, view.id)
      const removeTransition = findRemoveTransition(state, view.id)

      let interpolatedMoveTransition

      if (moveTransition) {
        interpolatedMoveTransition = interpolateMoveTransition(moveTransition)
      } else {
        interpolatedMoveTransition = {
          x: 0,
          y: 0
        }
      }

      let interpolatedRemoveTransition

      if (removeTransition) {
        interpolatedRemoveTransition = interpolateRemoveTransition(removeTransition)
      } else {
        interpolatedRemoveTransition = 1
      }

      view.setStyle(cellModel, interpolatedMoveTransition, interpolatedRemoveTransition * 0.6)
    })

    this.renderer.render(this.stage)
  }
}

function findById<ItemType extends { id: number }>(array: ItemType[], id: number) {
  return array.find(item => item.id === id)
}

function findMoveTransition(state: AppState, target: CellId) {
  return state.moveTransitions.find(t => t.target === target)
}

function findRemoveTransition(state: AppState, target: CellId) {
  return state.removeTransitions.find(t => t.target === target)
}

function interpolateMoveTransition(t: MoveTransition) {
  const progress = t.progress || 0

  return {
    x: t.from.x + (t.to.x - t.from.x) * progress,
    y: t.from.y + (t.to.y - t.from.y) * progress
  }
}

function interpolateRemoveTransition(t: RemoveTransition) {
  const progress = t.progress || 0

  return 1 - progress
}
