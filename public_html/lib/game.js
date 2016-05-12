window.addEventListener("load",function() {
var st;
var Q = Quintus({ audioSupported: [ 'wav','mp3' ] }).include("Sprites, Scenes, Input, 2D, UI, Audio").setup({maximize: true}).controls();
Q.enableSound();

Q.tilePos = function(col,row) {
    return { x: col*16 + 24, y: row*16 + 24 };
};

Q.scene('hud', function(stage) {
    var container = stage.insert(new Q.UI.Container({
        x: window.innerWidth/2, y: 0
    }));

    var moves = container.insert(new Q.UI.Text({x: 20, y: 20,
        label: "Moves: " + 0, color: "white", align: "center"}));
});

Q.SPRITE_NONE     = 0;
Q.SPRITE_DEFAULT  = 1;
Q.SPRITE_PARTICLE = 2;
Q.SPRITE_ACTIVE   = 4;

Q.scene("level1", function(stage)
{
    var background = new Q.TileLayer({dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 16, tileH: 16, type: Q.SPRITE_NONE});
    stage.insert(background);
    stage.collisionLayer(new Q.TileLayer({dataAsset: 'level1.tmx', layerIndex: 1, sheet: 'tiles', tileW: 16, tileH: 16, type: Q.SPRITE_DEFAULT}));
    var player = stage.insert(new Q.Player(Q.tilePos(10, 7)));
    var box1 = stage.insert(new Q.Box(Q.tilePos(4, 6)));
    var box2 = stage.insert(new Q.Box(Q.tilePos(1, 6)));
    var box3 = stage.insert(new Q.Box(Q.tilePos(4, 3)));
    var box4 = stage.insert(new Q.Box(Q.tilePos(4, 1)));
    var box5 = stage.insert(new Q.Box(Q.tilePos(6, 3)));
    var box6 = stage.insert(new Q.Box(Q.tilePos(6, 2)));
    
    stage.add("viewport");
    st = stage;
});

Q.load("tiles.png, level1.tmx, tiles.json, player.png, box.png, point.png, step.wav", function()
{
    Q.sheet("tiles", "tiles.png", {tilew: 16, tileh: 16});
    //Q.compileSheets("tiles.png","tiles.json");
    Q.sheet("player", "player.png");
    Q.sheet("box", "box.png");
    //Q.sheet("point", "point.png"); 
    
   Q.stageScene("hud", 1);
   Q.stageScene("UI", 1);
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

Q.component("playerControls", {
    
    added: function() {
      var p = this.entity.p;

      if(!p.stepDistance) { p.stepDistance = 16; }
      if(!p.stepDelay) { p.stepDelay = 0.2; }

      p.stepWait = 0;
      this.entity.on("step",this,"step");
      this.entity.on("hit", this,"collision");
    },

    collision: function(col) {
      var p = this.entity.p;

      if(p.stepping) {
        p.stepping = false;
        p.x = p.origX;
        p.y = p.origY;
      }

    },

    step: function(dt) {
      var p = this.entity.p,
          moved = false;
      p.stepWait -= dt;

      if(p.stepping) {
        p.x += p.diffX * dt / p.stepDelay;
        p.y += p.diffY * dt / p.stepDelay;
      }

      if(p.stepWait > 0) { return; }
      if(p.stepping) {
        p.x = p.destX;
        p.y = p.destY;
      }
      p.stepping = false;

      p.diffX = 0;
      p.diffY = 0;

      if(Q.inputs['left']) {
        Q.audio.play('step.wav');
        p.diffX = -p.stepDistance;
      } else if(Q.inputs['right']) {
        Q.audio.play('step.wav');
        p.diffX = p.stepDistance;
      }

      if(Q.inputs['up']) {
        Q.audio.play('step.wav');
        p.diffY = -p.stepDistance;
      } else if(Q.inputs['down']) {
        Q.audio.play('step.wav');
        p.diffY = p.stepDistance;
      }

      if(p.diffY || p.diffX ) { 
        p.stepping = true;
        p.origX = p.x;
        p.origY = p.y;
        p.destX = p.x + p.diffX;
        p.destY = p.y + p.diffY;
        p.stepWait = p.stepDelay; 
      }

    }

});

Q.Sprite.extend("Player", {
    init: function(p) {
        this._super(p,
            {
                asset: "player.png",
                scale: 0.9, 
                moves: 0
            });
            
        this.add('2d, playerControls');
    },
    step: function(p) {
        if((Q.inputs["left"] || Q.inputs["right"] || Q.inputs["up"] || Q.inputs["down"])){
            this.p.moves += 1;
            var movesLabel = Q("UI.Text", 1).items[0];
            movesLabel.p.label = 'Moves: ' + this.p.moves;
            return false;
        }
    }
});

Q.Sprite.extend("Box", {
    init: function(p) {
    this._super(p,
    {
        asset: "box.png",
        scale: 0.9
    });
        this.add('2d');
        this.on("step", this, "step");
    },
    step: function(dt) {
        var p = this.p;
        var maxCol = 10, collided = false;
        p.hit = false;
        while((collided = this.stage.search(this)) && maxCol > 0) {
            if(collided.obj.isA("Player")) {
                p.hit = true;
                this.p.x -= collided.separate[0];
                this.p.y -= collided.separate[1];
            }
            maxCol--;
        }
    }
});

Q.scene('ui', function(stage){
    Q.state.set({ Moves: 0});
    UiCoins.innerHTML = "Moves: " + Q.state.get("moves");
     
    Q.state.on("change.moves",this, function() {
        UiMoves.innerHTML = "Moves: " + Q.state.get("Moves");
    });
});

Q.scene("UI",function(stage) {
var container = stage.insert(new Q.UI.Container({
      fill: "gray",
      border: 5,
      shadow: 10,
      shadowColor: "rgba(0,0,0,0.5)",
      y: 30,
      x: Q.width/1.82  
    }));
    
    stage.insert(new Q.UI.Text({ 
      label: "Sokoban",
      color: "white",
      x: 0,
      y: 0
    }),container);
    
    container.fit(20,20);
});

});