var st;
var Q = Quintus().include("Sprites, Scenes, Input, 2D").setup({maximize: true}).controls();

Q.tilePos = function(col,row) {
  return { x: col*16 + 24, y: row*16 + 24 };
};

Q.wallPos = function(col,row) {
      return { x: col*16 + 24, y: row*16 + 24, frame: 5 };
};

Q.SPRITE_NONE     = 0;
Q.SPRITE_DEFAULT  = 1;
Q.SPRITE_PARTICLE = 2;
Q.SPRITE_ACTIVE   = 4;

Q.scene("level1", function(stage)
{
    var background = new Q.TileLayer({dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 16, tileH: 16, type: Q.SPRITE_NONE});
    stage.insert(background);
    var collisionLayer = stage.collisionLayer(new Q.TileLayer({dataAsset: 'level1.tmx', layerIndex: 1, sheet: 'tiles', tileW: 16, tileH: 16, type: Q.SPRITE_DEFAULT}));
    var player = stage.insert(new Q.Player(Q.tilePos(10, 7)));
    var box1 = stage.insert(new Q.Box(Q.tilePos(4, 6)));
    var box2 = stage.insert(new Q.Box(Q.tilePos(1, 6)));
    var box3 = stage.insert(new Q.Box(Q.tilePos(4, 3)));
    var box4 = stage.insert(new Q.Box(Q.tilePos(4, 1)));
    var box5 = stage.insert(new Q.Box(Q.tilePos(6, 3)));
    var box6 = stage.insert(new Q.Box(Q.tilePos(6, 2)));
    
    //var point = stage.insert(new Q.Point(Q.tilePos(16, 5)));
    stage.add("viewport");
    st = stage;
});

Q.load("tiles.png, level1.tmx, tiles.json, player.png, box.png, point.png", function()
{
    Q.sheet("tiles", "tiles.png", {tilew: 16, tileh: 16});
    Q.compileSheets("tiles.png","tiles.json");
    Q.sheet("player", "player.png");
    Q.sheet("box", "box.png");
    Q.sheet("point", "point.png");
    Q.stageScene("level1");

});

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

Q.controls();

Q.component("playerControl", {
    defaults: {speed: 0, direction: 'up'},

    added: function() {
        var p = this.entity.p;

        Q._defaults(p, this.defaults);

        this.entity.on("step", this, "step");
    },
    step: function(dt) {
        var p = this.entity.p;
       
        
        if (Q.inputs['left'])
        {
            p.x = p.x - 2;
        }
        if (Q.inputs['right'])
        {
            p.x = p.x + 2;
        }
        if (Q.inputs['up'])
        {
            p.y = p.y - 2;
        }
        if (Q.inputs['down'])
        {
            p.y = p.y + 2;
        }
    }
});

Q.Sprite.extend("Wall",{
  init: function(p) {
    this._super(p,{
      sheet: "tile",
      sprite: "tile",
      w: 16,
      h: 16,
      type: Q.SPRITE_DEFAULT
    });
  },

  draw: function(ctx) {
    ctx.fillStyle = this.p.color;
    // Draw a filled rectangle centered at
    // 0,0 (i.e. from -w/2,-h2 to w/2, h/2)
    ctx.fillRect(-this.p.cx,
                 -this.p.cy,
                 this.p.w,
                 this.p.h);

  }
});

Q.Sprite.extend("Player", {
    init: function(p) {
        this._super(p,
                {
                    asset: "player.png",
                    scale: 0.9,
                });
        this.add('2d, playerControl');
        this.on("hit.sprite", this, "hit");
    },
    hit: function(collision) {
        //this.stage.collide(this);
    }
});


Q.Sprite.extend("Box", {
        init: function(p) {
            this._super(p, {
                asset: "box.png",
                collisionMask: Q.SPRITE_DEFAULT
            });
            this.add("2d");
            this.on("hit.sprite", this, "step");
        },
        step: function(dt) {
                this.stage.collide(this);  
        }
    /*
    collision: function(col) {
        // .. do anything custom you need to do ..
        
        // Move the sprite away from the collision
        this.p.x -= col.separate[0]; // normalX multiplied by distance  
        this.p.y -= col.separate[1];

    },

    step: function(dt) {
      // Tell the stage to run collisions on this sprite
      this.stage.collide(this);
    }/*
    hit: function (collision) {
        if(collision.obj.isA("Player")) {
            collision.obj.isA("stage");
        }
    }*/
});
    
Q.Sprite.extend("Point", {
        init: function(p) {
            this._super(p, {
                asset: "point.png"
            });
             
        }
});