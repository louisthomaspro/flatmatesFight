import Player from "./player"
import MainScene from "./main-scene"

export default class Gamepad {

    player: Player
    pad: Phaser.Input.Gamepad.Gamepad
    destroyed: boolean

    constructor(pad?: Phaser.Input.Gamepad.Gamepad) {
        if (pad) this.pad = pad
        this.destroyed = false
    }


    exist() {
        return (this.pad) ? true : false
    }

    init(pad: Phaser.Input.Gamepad.Gamepad) {
        this.pad = pad
    }

    removePad() {
        this.pad = null
    }

    joystickRight() {
        return (this.pad && this.pad.leftStick.x > 0.75)
    }

    joystickLeft() {
        return (this.pad && this.pad.leftStick.x < -0.75)
    }

    buttonA() {
        return (this.pad && this.pad.A)
    }

    buttonB() {
        return (this.pad && this.pad.B)
    }

    buttonX() {
        return (this.pad && this.pad.X)
    }

    buttonY() {
        return (this.pad && this.pad.Y)
    }

    buttonR2() {
        return (this.pad && this.pad.axes[5].value == 1)
    }

    destroy() {
    }

}
