import { Player } from "./player";
import { MainScene } from "./main-scene";

const DEGREES_TO_RADIANS = Math.PI / 180;

export default class Grab {

    player : any;
    grabSensor : any;
    gameObject : any;
    isGrabbing : any;

    constructor(player : Player, scene : MainScene) {
        this.player = player;
        this.grabSensor = scene.matter.add.rectangle(player.sprite.x, player.sprite.y, 30, 50, { isSensor: true, isStatic: true, angle: -35 * DEGREES_TO_RADIANS });
        
        this.gameObject = null;
        this.isGrabbing = false;

        scene.matterCollision.addOnCollideStart({
            objectA: [this.grabSensor],
            callback: this.onSensorCollide,
            context: this
        });
        // scene.matterCollision.addOnCollideActive({
        //     objectA: [this.grabSensor],
        //     callback: this.onSensorCollide,
        //     context: this
        // });
        scene.matterCollision.addOnCollideEnd({
            objectA: [this.grabSensor],
            callback: this.onSensorEnd,
            context: this
        });

    }

    // @ts-ignore
    onSensorCollide({ bodyA, bodyB, pair }) {
        if (bodyB.isSensor || (bodyB.gameObject.getData('name') != "coucou")) return; // We only care about collisions with physical objects and crates
        bodyB.gameObject.setAlpha(0.5, 0.5, 0.5, 0.5);
        this.gameObject = bodyB;
    }

    // @ts-ignore
    onSensorEnd({ bodyA, bodyB, pair }) {
        if (!bodyB.gameObject) return;
        if (bodyB.isSensor || (bodyB.gameObject.getData('name') != "coucou")) return; // We only care about collisions with physical objects
        bodyB.gameObject.setAlpha(1, 1, 1, 1);
    }

    update() {
        // @ts-ignore
        const { Body } = Phaser.Physics.Matter.Matter; // Native Matter modules
        if (!this.player.direction) { //left 
            Body.setAngle(this.grabSensor, -35);
            Body.setPosition(this.grabSensor, { x: this.player.sprite.getCenter().x - 30, y: this.player.sprite.getCenter().y + 10 });
        } else {
            Body.setAngle(this.grabSensor, 35);
            Body.setPosition(this.grabSensor, { x: this.player.sprite.getCenter().x + 30, y: this.player.sprite.getCenter().y + 10 });
        }

    }

    destroy() {
    }

}
