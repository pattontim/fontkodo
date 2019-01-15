let type = "WebGL"
        if(!PIXI.utils.isWebGLSupported()){
          type = "canvas"
        }

        PIXI.utils.sayHello(type)
        //Create a Pixi Application
        let app = new PIXI.Application({width: 1080, height: 540});
        document.getElementById("canvasholder").appendChild(app.view);

        // var text1 = new PIXI.extras.BitmapText('Some example text', { font: '16px SegoeUI' });
        let text1 = new PIXI.Text('This is a PixiJS text',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
        text1.position.x = 0
        text1.position.y = 0;
        app.stage.addChild(text1);

        //Add the canvas that Pixi automatically created for you to the HTML document
        // document.body.appendChild(app.view);

// function Score() {
//         PIXI.Container.call(this);

//         this.interactive = false;
//         // this.buttonMode = false;
//         // this.visible = false;

//         this.bgGraphics = new PIXI.Graphics();
//         this.bgGraphics.beginFill(0xFFCC00, 1);
//         this.bgGraphics.drawRect(0, 0, Score.WIDTH, Score.HEIGHT);
//         this.bgGraphics.endFill();
//         this.addChild(this.bgGraphics);

//         this.text = new PIXI.Text('XXX', {font: '20px Arial', fill: 0xFFFFFF});
//         this.text.x = 1;
//         this.text.y = 1;
//         this.addChild(this.text);
// }

// Score.prototype = Object.create(PIXI.Container.prototype);
// Score.prototype.constructor = Score;

// Score.WIDTH  = 36;
// Score.HEIGHT = 24;

// Score.prototype.setText = function(str) {
//         this.text.text = str;
// }