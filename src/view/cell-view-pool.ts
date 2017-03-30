import { Graphics } from 'pixi.js'
import { Cell, CellId, CellColor, MoveTransitionState } from '../store/store'

export interface CellStyle {
  size: number
  padding: number
  colorA: number
  colorB: number
}

export class CellView {
  public graphics = new Graphics()
  private previousColor: CellColor

  constructor (public id: CellId, public style: CellStyle) {
    console.log('New cellView created')
  }


  public setStyle(cellModel: Cell, transition: MoveTransitionState) {
    this.graphics.x = (cellModel.x + transition.x) * this.style.size
    this.graphics.y = (cellModel.y + transition.y) * this.style.size

    if (this.previousColor === cellModel.color) {
      return
    }

    this.previousColor = cellModel.color

    const padding = this.style.padding
    const size = this.style.size - padding

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

export class CellViewPool {
  private freeCells: CellView[] = []

  public getCell(id: CellId, style: CellStyle) {
    let cell = this.freeCells.pop()

    if (cell) {
      return cell
    }

    return new CellView(id, style)
  }

  public freeCellView(cellView: CellView) {
    if (this.freeCells.indexOf(cellView) !== -1) {
      throw 'CellView is already freed'
    } else {
      this.freeCells.push(cellView)
    }
  }
}