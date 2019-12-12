import Player from "./player";
import RotatingPlatform from "./rotating-platform";

export default class MainScene extends Phaser.Scene {

  player1: Player;
  player2: Player;

  matterCollision: any;
  unsubscribePlayerCollide: any;
  unsubscribeCelebrate: any;


  
  preload() {

    this.load.tilemapTiledJSON("map", "../assets/tilemaps/level.json"); // tilemap
    this.load.image("kenney-tileset-64px-extruded", "../assets/tilesets/kenney-tileset-64px-extruded.png"); // tileset

    this.load.image("wooden-plank", "../assets/images/wooden-plank.png"); // wooden-plank
    this.load.image("block", "../assets/images/block.png"); // block

    // player sprite
    this.load.spritesheet("player", "../assets/spritesheets/0x72-industrial-player-32px-extruded.png",
      {
        frameWidth: 32,
        frameHeight: 32,
        margin: 1,
        spacing: 2
      }
    );

    this.load.atlas("emoji", "../assets/atlases/emoji.png", "../assets/atlases/emoji.json"); // emoji + collision with PhysicsEditor   

  }


  create() {

    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("kenney-tileset-64px-extruded");
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0);
    const lavaLayer = map.createDynamicLayer("Lava", tileset, 0, 0);
    map.createDynamicLayer("Background", tileset, 0, 0);
    map.createDynamicLayer("Foreground", tileset, 0, 0).setDepth(10);

    // Set colliding tiles before converting the layer to Matter bodies
    groundLayer.setCollisionByProperty({ collides: true });
    lavaLayer.setCollisionByProperty({ collides: true });

    // Get the layers registered with Matter. Any colliding tiles will be given a Matter body. We
    // haven't mapped our collision shapes in Tiled so each colliding tile will get a default
    // rectangle body (similar to AP).
    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // The spawn point is set using a point object inside of Tiled (within the "Spawn" object layer)
    // @ts-ignore
    const { x, y } = map.findObject("Spawn", obj => obj.name === "Spawn Point");
    const { LEFT, RIGHT, UP, Q, D, Z, A, CTRL } = Phaser.Input.Keyboard.KeyCodes;

    this.player1 = new Player(this, x + 50, y, LEFT, RIGHT, UP, CTRL);
    this.player2 = new Player(this, x, y, Q, D, Z, A);


    // Functions that remove collision listeners
    this.unsubscribePlayerCollide = this.matterCollision.addOnCollideStart({
      objectA: this.player1.sprite,
      callback: this.onPlayerCollide,
      context: this
    });
    this.unsubscribePlayerCollide = this.matterCollision.addOnCollideStart({
      objectA: this.player2.sprite,
      callback: this.onPlayerCollide,
      context: this
    });


    // Load up some crates from the "Crates" object layer created in Tiled
    map.getObjectLayer("Crates").objects.forEach(crateObject => {
      const { x, y, width, height } = crateObject;

      // Tiled origin for coordinate system is (0, 1), but we want (0.5, 0.5)
      this.matter.add
        .image(x + width / 2, y - height / 2, "block")
        .setBody({ shape: "rectangle", density: 0.001 }, null)
        .setData("name", "crate");
    });

    // Create platforms at the point locations in the "Platform Locations" layer created in Tiled
    map.getObjectLayer("Platform Locations").objects.forEach(point => {
      new RotatingPlatform(this, point.x, point.y);
    });

    // Create a sensor at rectangle object created in Tiled (under the "Sensors" layer)
    const rect = map.findObject("Sensors", obj => obj.name === "Celebration") as any;
    const celebrateSensor = this.matter.add.rectangle(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width,
      rect.height,
      {
        isSensor: true, // It shouldn't physically interact with other bodies
        isStatic: true // It shouldn't move
      }
    );
    this.unsubscribeCelebrate = this.matterCollision.addOnCollideStart({
      objectA: this.player1.sprite,
      objectB: celebrateSensor,
      callback: this.onPlayerWin,
      context: this
    });

    const help = this.add.text(16, 16, "Arrows/QSDZ to move the player.", {
      fontSize: "18px",
      padding: { x: 10, y: 5 },
      backgroundColor: "#ffffff",
      fill: "#000000"
    });
    help.setScrollFactor(0).setDepth(1000);

    // When gamepad is connected
    this.input.gamepad.addListener('connected', this.linkGamepad, this);

  }


  // Link gamepad to a player
  linkGamepad(pad: any) {
    console.log('Gamepad connected : ' + pad.id);
    if (!this.player1.isPadExist()) {
      this.player1.initPad(pad);
      return;
    }
    if (!this.player2.isPadExist()) {
      this.player2.initPad(pad);
      return;
    }
  }



  onPlayerCollide({ gameObjectB } : any) {
    if (!gameObjectB || !(gameObjectB instanceof Phaser.Tilemaps.Tile)) return;

    const tile = gameObjectB;

    // Check the tile property set in Tiled (you could also just check the index if you aren't using
    // Tiled in your game)
    if (tile.properties.isLethal) {
      // Unsubscribe from collision events so that this logic is run only once
      this.unsubscribePlayerCollide();

      this.player1.freeze();
      const cam = this.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => this.scene.restart());
    }
  }


  onPlayerWin() {
    // Celebrate only once
    this.unsubscribeCelebrate();

    // Drop some heart-eye emojis, of course
    for (let i = 0; i < 35; i++) {
      const x = this.player1.sprite.x + Phaser.Math.RND.integerInRange(-50, 50);
      const y = this.player1.sprite.y - 150 + Phaser.Math.RND.integerInRange(-10, 10);
      this.matter.add
        .image(x, y, "emoji", "1f60d", {
          restitution: 1,
          friction: 0,
          density: 0.0001,
          shape: "circle"
        })
        .setScale(0.5);
    }
  }


}
