import Player from "./player";
import MainScene from "./main-scene";

const DEGREES_TO_RADIANS = Math.PI / 180;

export default class Grab {

    player: Player;
    grabSensor: MatterJS.Body;
    bodyCaught: MatterJS.Body;
    scene: MainScene;
    catchCooldownTimer: any;
    canCatch: boolean;

    bodiesColliding: MatterJS.Body[];

    constructor(player: Player, scene: MainScene) {
        this.player = player;
        this.grabSensor = scene.matter.add.rectangle(player.sprite.x, player.sprite.y, 30, 50, { isSensor: true, isStatic: true, angle: -35 * DEGREES_TO_RADIANS });
        this.bodyCaught = null;
        this.scene = scene;

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

        this.canCatch = true;
        this.catchCooldownTimer = null;
        this.bodiesColliding = [];

    }

    onSensorCollide({ bodyA, bodyB, pair }: any) {
        if (bodyB.isSensor) return;
        if (bodyB.label != "crate") return;
        bodyB.gameObject.setAlpha(0.5, 0.5, 0.5, 0.5);

        this.bodiesColliding.push(bodyB);
    }

    onSensorEnd({ bodyA, bodyB, pair }: any) {
        if (!bodyB.gameObject) return;
        if (bodyB.isSensor || (bodyB.label != "crate")) return;
        bodyB.gameObject.setAlpha(1, 1, 1, 1);

        // @ts-ignore
        const index = this.bodiesColliding.findIndex(x => x.id === bodyB.id);
        if (index > -1) {
            this.bodiesColliding.splice(index, 1);
        }
    }

    grabbingAction(isGrabKeyDown: boolean) {

        if (isGrabKeyDown) {

            if (!this.bodyCaught && this.canCatch) { // nothing caught, let's catch it
                if (this.bodiesColliding.length == 0) return; // be sure that something is colliding
                this.bodyCaught = this.bodiesColliding[0];
                const bodyCaught = this.bodyCaught as any;
                bodyCaught.ignoreGravity = true;
                bodyCaught.gameObject.setCollisionGroup(-1);

            } else if (this.bodyCaught) { // Catching the object
                // @ts-ignore
                const { Body } = Phaser.Physics.Matter.Matter;
                Body.setPosition(this.bodyCaught, { x: this.player.sprite.getCenter().x, y: this.player.sprite.getCenter().y - 80, angle: -35 });
            }

        } else {

            if (this.bodyCaught) { // Remove the object
                const bodyCaught = this.bodyCaught as any;
                const bodyPlayer = this.player.sprite.body as any;
                bodyCaught.gameObject.setVelocity(bodyPlayer.velocity.x + (this.player.direction ? 10 : -10), bodyPlayer.velocity.y);
                bodyCaught.gameObject.setAngularVelocity(0.05);
                this.bodyCaught = null;
                bodyCaught.ignoreGravity = false;
                bodyCaught.gameObject.setCollisionGroup(0);

                // this.catchCooldownTimer = this.scene.time.addEvent({
                //     delay: 1000,
                //     callback: () => {
                //         this.canCatch = true;
                //     }
                // });


            }


        }
    }


    updateBodyDirection(direction: boolean) {

        // @ts-ignore
        const { Body } = Phaser.Physics.Matter.Matter;
        // Change sensor position when the player change direction
        if (!direction) { // left
            Body.setAngle(this.grabSensor, -35);
            Body.setPosition(this.grabSensor, { x: this.player.sprite.getCenter().x - 30, y: this.player.sprite.getCenter().y + 10 });
        } else { // right
            Body.setAngle(this.grabSensor, 35);
            Body.setPosition(this.grabSensor, { x: this.player.sprite.getCenter().x + 30, y: this.player.sprite.getCenter().y + 10 });
        }

    }

    destroy() {
    }

}
