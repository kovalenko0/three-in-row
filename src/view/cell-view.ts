import { Graphics } from 'pixi.js'
import { Cell, CellColor, MoveTransitionState } from '../store/store'

export interface CellStyle {
  size: number
  padding: number
  colorA: number
  colorB: number
}

export class CellView {
  public graphics = new Graphics()

  private previousColor: CellColor

  constructor (public id: number, public style: CellStyle) {}

  public setStyle(cellModel: Cell, transition: MoveTransitionState, alpha: number) {
    this.graphics.x = (cellModel.x + transition.x) * this.style.size
    this.graphics.y = (cellModel.y + transition.y) * this.style.size
    this.graphics.alpha = alpha

    if (this.previousColor === cellModel.color) {
      return
    }

    this.previousColor = cellModel.color

    const padding = this.style.padding
    const size = this.style.size - padding

    this.graphics.clear()
    this.graphics.beginFill(cellModel.color === 'a' ? this.style.colorA : this.style.colorB)
    this.graphics.drawRect(
      padding,
      padding,
      size,
      size
    )
    this.graphics.endFill()
  }
}
