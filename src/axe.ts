import Player from "./player";
import MainScene from "./main-scene";

export default class Axe {

    axe: Phaser.Physics.Matter.Sprite;
    banana : Phaser.Physics.Matter.Sprite;
    scene: MainScene;
    player: Player;

    constructor(scene: MainScene) {


        let weaponsShapes = scene.game.cache.json.get('weapons-shapes');


        this.axe = scene.matter.add.sprite(400, 50, 'axe', null, {shape: weaponsShapes.axe});
       
        

       
        scene.matterCollision.addOnCollideStart({
            objectA: [this.axe],
            callback: this.onSensorCollide,
            context: this
        });
        // scene.matterCollision.addOnCollideActive({
        //     objectA: [this.axe],
        //     callback: this.onSensorCollide,
        //     context: this
        // });
        scene.matterCollision.addOnCollideEnd({
            objectA: [this.axe],
            callback: this.onSensorEnd,
            context: this
        });

    }

    onSensorCollide({ bodyA, bodyB, pair }: any) {
    }

    onSensorEnd({ bodyA, bodyB, pair }: any) {
    }


    destroy() {
    }

}
