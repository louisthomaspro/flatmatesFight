import Phaser from "phaser"

import MainScene from "./main-scene"
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin"


const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 768,
    input: {
      gamepad: true
    },
    backgroundColor: "#000c1f",
    parent: "game-container",
    scene: [MainScene],
    pixelArt: true,
    physics: {
      default: "matter",
      matter: {
        // gravity: {
        //   y: 1
        // },
        // debug: true
      }
    },
    plugins: {
        scene: [
          {
            plugin: PhaserMatterCollisionPlugin, // The plugin class
            key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
            mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
          }
        ]
      }
  }

  let game = new Phaser.Game(config)