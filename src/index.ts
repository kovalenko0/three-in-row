import {
  autoDetectRenderer,
  Container,
  Rectangle,
  Graphics
} from 'pixi.js'

const renderer = autoDetectRenderer(256, 256)

document.querySelector('#stage').appendChild(renderer.view)

const stage = new Container()
const graphics = new Graphics()

graphics.beginFill(0xffffff)
graphics.drawRect(100, 100, 100, 100)

graphics.lineStyle(2, 0xff0000)

graphics.moveTo(10, 10)
graphics.lineTo(40, 40)

stage.addChild(graphics)

renderer.render(stage)
