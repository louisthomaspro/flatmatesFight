import Player from "./player"
import RotatingPlatform from "./rotating-platform"
import Axe from "./axe"
import Crate from "./crate"

export default class MainScene extends Phaser.Scene {

  players: Player[]

  matterCollision: any
  unsubscribePlayer1Collide: any
  unsubscribePlayer2Collide: any
  unsubscribeCelebrate: any

  scoreText: Phaser.GameObjects.Text
  fpsText: Phaser.GameObjects.Text

  x_default: number
  y_default: number

  gamepadIndex: Player[] // [2] is linked to a player



  preload() {

    this.load.tilemapTiledJSON("map", "../assets/tilemaps/level.json") // tilemap
    this.load.image("kenney-tileset-64px-extruded", "../assets/tilesets/kenney-tileset-64px-extruded.png") // tileset

    this.load.image("wooden-plank", "../assets/images/wooden-plank.png") // wooden-plank
    this.load.image("block", "../assets/images/block.png") // block

    // player sprite
    this.load.spritesheet("player", "../assets/spritesheets/0x72-industrial-player-32px-extruded.png",
      {
        frameWidth: 32,
        frameHeight: 32,
        margin: 1,
        spacing: 2
      }
    )

    this.load.atlas("emoji", "../assets/atlases/emoji.png", "../assets/atlases/emoji.json") // emoji + collision with PhysicsEditor   


    this.load.image("axe", "../assets/axe.png") // axe

    // Load body shapes from JSON file generated using PhysicsEditor
    this.load.json('weapons-shapes', '../weapons.json')

  }


  create() {


    const map = this.make.tilemap({ key: "map" })
    const tileset = map.addTilesetImage("kenney-tileset-64px-extruded")
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0)
    const lavaLayer = map.createDynamicLayer("Lava", tileset, 0, 0).setDepth(12)
    map.createDynamicLayer("Background", tileset, 0, 0)
    map.createDynamicLayer("Foreground", tileset, 0, 0).setDepth(10)

    // Set colliding tiles before converting the layer to Matter bodies
    groundLayer.setCollisionByProperty({ collides: true })
    lavaLayer.setCollisionByProperty({ collides: true })
    groundLayer.setCollisionByProperty({ collides: true })

    // Get the layers registered with Matter. Any colliding tiles will be given a Matter body. We
    // haven't mapped our collision shapes in Tiled so each colliding tile will get a default
    // rectangle body (similar to AP).
    this.matter.world.convertTilemapLayer(groundLayer)
    this.matter.world.convertTilemapLayer(lavaLayer)


    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    // this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

    // The spawn point is set using a point object inside of Tiled (within the "Spawn" object layer)
    // @ts-ignore
    const { x, y } = map.findObject("Spawn", obj => obj.name === "Spawn Point")
    this.x_default = x
    this.y_default = y
    const { LEFT, RIGHT, UP, Q, D, Z, A, CTRL } = Phaser.Input.Keyboard.KeyCodes

    this.players = []
    this.players.push(new Player(this, x, y, LEFT, RIGHT, UP, CTRL))
    // this.players.push(new Player(this, x, y, Q, D, Z, A))

    // let axe1 = new Axe(this)

    this.players.forEach(player => {
      player.sprite.setCollisionGroup(-1)
    })



    // Load up some crates from the "Crates" object layer created in Tiled
    map.getObjectLayer("Crates").objects.forEach(crateObject => {
      const { x, y, width, height } = crateObject

      // Tiled origin for coordinate system is (0, 1), but we want (0.5, 0.5)
      new Crate(this, x + width / 2, y - height / 2);

      // .setBody({ shape: "rectangle", density: 0.001}, null) as any
    })

    // Create platforms at the point locations in the "Platform Locations" layer created in Tiled
    map.getObjectLayer("Platform Locations").objects.forEach(point => {
      new RotatingPlatform(this, point.x, point.y)
    })

    // Create a sensor at rectangle object created in Tiled (under the "Sensors" layer)
    const rect = map.findObject("Sensors", obj => obj.name === "Celebration") as any
    const celebrateSensor = this.matter.add.rectangle(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width,
      rect.height,
      {
        isSensor: true, // It shouldn't physically interact with other bodies
        isStatic: true // It shouldn't move
      }
    )
    // this.unsubscribeCelebrate = this.matterCollision.addOnCollideStart({
    //   objectA: this.player1.sprite,
    //   objectB: celebrateSensor,
    //   callback: this.onPlayerWin,
    //   context: this
    // })

    // const help = this.add.text(16, 16, "Arrows/QSDZ to move the player.", {
    //   fontSize: "18px",
    //   padding: { x: 10, y: 5 },
    //   backgroundColor: "#ffffff",
    //   fill: "#000000"
    // })
    // help.setScrollFactor(0).setDepth(1000)

    // When gamepad is connected
    this.input.gamepad.addListener('connected', this.linkGamepad, this)
    this.input.gamepad.addListener('disconnected', this.unlinkGamepad, this)


    // Debug text
    this.fpsText = this.add.text(this.cameras.main.width - 60, 10, '', { font: '16px Courier', fill: '#ffffff' })
    this.scoreText = this.add.text(10, 10, '', { font: '16px Courier', fill: '#ffffff' })
    this.gamepadIndex = [];

  }


  // Link gamepad to a player
  linkGamepad(pad: Phaser.Input.Gamepad.Gamepad) {
    console.log('Gamepad connected : ' + pad.id)

    // Init pad for existing players
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i]) {
        const player = this.players[i];
        if (!player.gamepad.exist()) {
          player.gamepad.init(pad)
          this.players[pad.index] = player
          return
        }
      }
    }

    // New players
    const newPlayer = new Player(this, this.x_default, this.y_default)
    newPlayer.gamepad.init(pad)
    this.players[pad.index] = newPlayer
  }

  unlinkGamepad(pad: Phaser.Input.Gamepad.Gamepad) {
    if (this.players[pad.index]) {
      console.log("pad unlinked : destroying player")
      this.players[pad.index].destroy()
      this.players[pad.index] = null
    }
  }




  // onPlayerWin() {
  //   // Celebrate only once
  //   this.unsubscribeCelebrate()

  //   // Drop some heart-eye emojis, of course
  //   for (let i = 0 i < 35 i++) {
  //     const x = this.player1.sprite.x + Phaser.Math.RND.integerInRange(-50, 50)
  //     const y = this.player1.sprite.y - 150 + Phaser.Math.RND.integerInRange(-10, 10)
  //     this.matter.add
  //       .image(x, y, "emoji", "1f60d", {
  //         restitution: 1,
  //         friction: 0,
  //         density: 0.0001,
  //         shape: "circle"
  //       })
  //       .setScale(0.5)
  //   }
  // }


  update() {
    this.fpsText.setText(this.game.loop.actualFps.toPrecision(4).toString())

    let newScore: string[] = []
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i]) {
        const player = this.players[i];
        newScore.push("player " + (i + 1).toString() + " : " + player.life.toString())
      }
    }

    this.scoreText.setText(newScore)
  }



}
