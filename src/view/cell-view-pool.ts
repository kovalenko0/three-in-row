import { Graphics, Container } from 'pixi.js'
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
    console.warn('cell created')
  }

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

  constructor (private stage: Container) {}

  public getCell(id: CellId, style: CellStyle) {
    let cell = this.freeCells.pop()

    if (cell) {
      cell.id = id
    } else {
      cell = new CellView(id, style)
    }

    this.stage.addChild(cell.graphics)

    return cell
  }

  public freeCellView(cellView: CellView) {
    if (this.freeCells.indexOf(cellView) !== -1) {
      throw 'CellView is already freed'
    } else {
      this.stage.removeChild(cellView.graphics)
      this.freeCells.push(cellView)
    }
  }
}
