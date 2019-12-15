import Player from "./player"
import MainScene from "./main-scene"

export default class Crate {

    scene: MainScene
    player: Player
    image: Phaser.Physics.Matter.Image
    destroyed: boolean

    constructor(scene: MainScene, x: number, y: number) {

        this.scene = scene
        this.image = this.scene.matter.add.image(x, y, "block", null, { label: "crate", friction: 0.05 })

        // scene.matterCollision.addOnCollideStart({
        //     objectA: [this.image],
        //     callback: this.onSensorCollide,
        //     context: this
        // })
        // scene.matterCollision.addOnCollideActive({
        //     objectA: [this.axe],
        //     callback: this.onSensorCollide,
        //     context: this
        // })
        // scene.matterCollision.addOnCollideEnd({
        //     objectA: [this.image],
        //     callback: this.onSensorEnd,
        //     context: this
        // })


        this.destroyed = false
        this.scene.events.on("update", this.update, this)
        this.scene.events.once("shutdown", this.destroy, this)
        this.scene.events.once("destroy", this.destroy, this)

    }

    onSensorCollide({ bodyA, bodyB, pair }: any) {
    }

    onSensorEnd({ bodyA, bodyB, pair }: any) {
    }

    update() {
        if (this.image.y > this.scene.cameras.main.height) {
            this.destroy()
        }
    }


    destroy() {
        console.log("destroy crate")

        this.scene.events.off("update", this.update, this)
        this.scene.events.off("shutdown", this.destroy, this)
        this.scene.events.off("destroy", this.destroy, this)

        this.destroyed = true
        this.image.destroy()
    }

}
