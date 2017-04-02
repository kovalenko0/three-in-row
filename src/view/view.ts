import {
  autoDetectRenderer,
  Container,
  WebGLRenderer,
  CanvasRenderer
} from 'pixi.js'

import {
  AppState,
  MoveTransition,
  RemoveTransition
} from '../store/store'

import { CellView } from './cell-view'

export class View {
  private renderer: WebGLRenderer | CanvasRenderer
  private stage: Container
  private cellViews: {
    [cellId: number]: CellView
  } = {}

  constructor(
    element: HTMLElement,
    private width: number,
    private height: number,
    private cellSize: number,
    private cellPadding: number,
    private colorA: number,
    private colorB: number,
    private offsetX: number = 0,
    private offsetY: number = 0
  ) {
    this.renderer = autoDetectRenderer(width, height)

    element.appendChild(this.renderer.view)

    this.stage = new Container()
  }

  public render(state: AppState) {
    state.cells.forEach(cellModel => {
      let view = this.cellViews[cellModel.id]

      if (!view) {
        view = new CellView(cellModel.id, {
          colorA: this.colorA,
          colorB: this.colorB,
          padding: this.cellPadding,
          size: this.cellSize
        })

        this.stage.addChild(view.graphics)

        this.cellViews[cellModel.id] = view
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

      interpolatedMoveTransition.x += this.offsetX
      interpolatedMoveTransition.y += this.offsetY

      let interpolatedRemoveTransition

      if (removeTransition) {
        interpolatedRemoveTransition = interpolateRemoveTransition(removeTransition)
      } else {
        interpolatedRemoveTransition = 1
      }

      view.setStyle(cellModel, interpolatedMoveTransition, interpolatedRemoveTransition)
    })
    this.renderer.render(this.stage)
  }
}

function findMoveTransition(state: AppState, target: number) {
  return state.moveTransitions[target]
}

function findRemoveTransition(state: AppState, target: number) {
  return state.removeTransitions[target]
}

function interpolateMoveTransition(t: MoveTransition) {
  const p = t.progress || 0
  const progress = p

  return {
    x: t.from.x + (t.to.x - t.from.x) * progress,
    y: t.from.y + (t.to.y - t.from.y) * progress
  }
}

function interpolateRemoveTransition(t: RemoveTransition) {
  const progress = t.progress || 0

  return 1 - progress
}
