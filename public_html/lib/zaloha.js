var st;
var Q = window.Q = Quintus({development: true})
        .include("Sprites, Scenes, Input, 2D, Anim, UI, Touch")
        .setup({maximize: false, width: window.innerWidth, height: window.innerHeight});
//        .setup({maximize: true});

//    Add in the default keyboard controls
//    along with joypad controls for touch
Q.input.keyboardControls();
Q.gravityY = 0;
Q.gravityX = 0;
Q.input.touchControls({
  controls:  [ ['left','<' ],
               ['up','^'],
               [],
               ['down', 'v' ],
               ['right','>' ]
]
});
Q.input.joypadControls();

Q.tilePos = function(col,row) {
  return { x: col*32 + 16, y: row*32 + 16 };
};

Q.controls();

Q.scene('hud', function(stage) {
    var container = stage.insert(new Q.UI.Container({
        x: window.innerWidth/2, y: 0
    }));

    var score = container.insert(new Q.UI.Text({x: 20, y: 20,
        label: "Score : " + 0, color: "white", align: "center"}));
});

// Load and start the level
Q.load("tiles.png, level1.tmx, player.png, player.json, box.png, box.json", function()
{
    Q.sheet("tiles", "tiles.png", {tilew: 32, tileh: 32});
    Q.compileSheets("player.png", "player.json");
    Q.compileSheets("box.png", "box.json");
    Q.stageScene("level1");
    Q.stageScene("hud", 1);

});

Q.scene("level1", function(stage)
{
    var background = new Q.TileLayer({dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 32, tileH: 32, type: Q.SPRITE_NONE});
    stage.insert(background);
    stage.collisionLayer(new Q.TileLayer({dataAsset: 'level1.tmx', layerIndex: 1, sheet: 'tiles', tileW: 32, tileH: 32, type: Q.SPRITE_DEFAULT}));
    var player = stage.insert(new Q.Player(Q.tilePos(7, 11)));
    var box = stage.insert(new Q.Box({x: 150, y: 150, frame: 0}));
    stage.add("viewport"); //.follow(player);
/*
    stage.viewport.scale = 1;
    if (window.innerWidth <= 240) {
    	stage.viewport.scale = 0.5;
    }
    if (window.innerWidth <= 480) {
    	stage.viewport.scale = 0.75;
    } else if (window.innerWidth >= 768) {
    	stage.viewport.scale = 2;
    }*/
    st = stage;

});


Q.component("playerControl", {
    defaults: {speed: 0, direction: 'up'},

    added: function() {
        var p = this.entity.p;

        // add in our default properties
        Q._defaults(p, this.defaults);

        // every time our entity steps
        // call our step method
        this.entity.on("step", this, "step");
    },
    step: function(dt) {
        // grab the entity's properties
        // for easy reference
        var p = this.entity.p;

        // rotate the player
        if (Q.inputs['left'])
        {
            //if (Q.inputs['up']) {
	    // ...
            //} else if (Q.inputs['down']) {
            //...
            //}
            p.x = p.x - 4;
            //p.angle = 90;
            this.entity.play("run_left");
        }
        if (Q.inputs['right'])
        {
            p.x = p.x + 4;
            //p.angle = 270;
            this.entity.play("run_right");
        }
        if (Q.inputs['up'])
        {
            p.y = p.y - 4;
            this.entity.play("run_up");
        }
        if (Q.inputs['down'])
        {
            p.y = p.y + 4;
            this.entity.play("run_down");
        }
    }
});



Q.Sprite.extend("Player", {
    init: function(p) {
        this._super(p,
                {x: 50,
                    y: 50,
                    sprite: "player",
                    sheet: "player",
                    score: 0,
                    scale: 0.5
                });
        this.add('2d, animation, playerControl');
        this.on("hit.sprite", this, "hit");
    },
    hit: function(collision) {
        if (collision.obj.isA("Box")) {
            
        }
    }
});


Q.Sprite.extend("Box", {
        init: function(p) {
            this._super(p, {
                asset: "box.png",
                scale: 1
            });
             
            this.on("hit");
        },
         
        hit: function(col){
            if(col.obj.isA("Player")) {
                Q.state.inc("box",this.p.coins);
            }
        },
         
        step: function(dt){
            this.stage.collide(this);
        }
    });

Q.animations('player', {
    run_left: {frames: [1, 2, 3, 4], rate: 1 / 4},
    run_right: {frames: [6, 7, 8, 5], rate: 1 / 4},
    run_up: {frames: [10, 11, 10, 12], rate: 1 / 4},
    run_down: {frames: [15, 16, 17, 18, 19], rate: 1 / 4},
    stand_left: {frames: [0], rate: 0},
    stand_right: {frames: [9], rate: 0},
    stand_up: {frames: [10], rate: 0},
    stand_down: {frames: [15], rate: 0}

});


