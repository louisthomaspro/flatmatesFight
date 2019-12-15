import Player from "./player";
import MainScene from "./main-scene";

const DEGREES_TO_RADIANS = Math.PI / 180;
const BODY_CAUGHT_HEIGHT = 65;
const BODY_SPEED = 0.3; // default : 0.2

const INTERACT_WITH: string[] = ["axe", "crate"];

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
        if (!INTERACT_WITH.includes(bodyB.label)) return;
        bodyB.gameObject.setAlpha(0.5, 0.5, 0.5, 0.5);

        this.bodiesColliding.push(bodyB);
        // console.log(this.bodiesColliding)
    }

    onSensorEnd({ bodyA, bodyB, pair }: any) {
        if (!bodyB.gameObject) return;
        if (!INTERACT_WITH.includes(bodyB.label)) return;
        bodyB.gameObject.setAlpha(1, 1, 1, 1);

        // @ts-ignore
        const index = this.bodiesColliding.findIndex(x => x.id === bodyB.id);
        if (index > -1) {
            this.bodiesColliding.splice(index, 1);
        }
    }

    grabbingAction(isGrabKeyDown: boolean) {

        if (isGrabKeyDown) {

            if (!this.bodyCaught && this.canCatch) { // CATCH
                if (this.bodiesColliding.length == 0) return; // be sure that something is colliding
                this.bodyCaught = this.bodiesColliding[0];
                const bodyCaught = this.bodyCaught as any;
                bodyCaught.ignoreGravity = true;                
                bodyCaught.gameObject.setCollisionGroup(-1);


            } else if (this.bodyCaught) { // CATCHING
                // @ts-ignore
                this.attractVelocity(this.player.sprite.body, this.bodyCaught.gameObject.body);
            }   

        } else {

            if (this.bodyCaught) { // Remove the object
                const bodyCaught = this.bodyCaught as any;
                const bodyPlayer = this.player.sprite.body as any;
                bodyCaught.gameObject.setVelocity(bodyPlayer.velocity.x + (this.player.direction ? 10 : -10), bodyPlayer.velocity.y);
                bodyCaught.gameObject.setAngularVelocity(0.05);
                this.bodyCaught = null;
                bodyCaught.ignoreGravity = false;

                this.catchCooldownTimer = this.scene.time.addEvent({
                    delay: 100,
                    callback: () => {
                        bodyCaught.gameObject.setCollisionGroup(0);
                    }
                });

            }

        }
    }

    attract(bodyA: any, bodyB: any) {
        let power = 1e-2;
        let positive = true;
        var force = {
            x: (bodyA.position.x - bodyB.position.x) * power * (positive ? 1 : -1),
            y: (bodyA.position.y - bodyB.position.y - BODY_CAUGHT_HEIGHT) * power * (positive ? 1 : -1),
        };

        // @ts-ignore
        const { Body } = Phaser.Physics.Matter.Matter;
        Body.applyForce(bodyB, bodyB.position, force);
    }


    attractVelocity(bodyA: any, bodyB: any) {
        let positive = true;
        var velocity = {
            x: (bodyA.position.x - bodyB.position.x) * BODY_SPEED * (positive ? 1 : -1),
            y: (bodyA.position.y - bodyB.position.y - BODY_CAUGHT_HEIGHT) * BODY_SPEED * (positive ? 1 : -1),
        };

        // @ts-ignore
        const { Body } = Phaser.Physics.Matter.Matter;        
        Body.setVelocity(bodyB, velocity);
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
