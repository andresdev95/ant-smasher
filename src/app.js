
/** 
 * For more information 
 * https://spicyyoghurt.com/tutorials/html5-javascript-game-development/images-and-sprite-animations
 * 
*/

class GameObject {
    constructor(context, x, y, vx, vy, mass) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.mass = mass;
    }
}

class Ant extends GameObject{
    static numColumns = 4;
    static numRows = 1;
    static frameWidth = 0;
    static frameHeight = 0;
    static image;
    static imageSplash;
    
    constructor(canvas, context, x, y, vx, vy, mass) {
        super(context, x, y, vx, vy, mass);

        //this.radius = mass > 0.5 ? 25 : 10; //25;
        this.radius = 15;

        this.maxWidth = canvas.width;
        this.maxHeight = canvas.height;
    
        this.currentFrame = 0;

        if (!Ant.image) {
            Ant.image = new Image();
            Ant.image.onload = () => {
                //Define the size of a frame
                Ant.frameWidth = Ant.image.width / Ant.numColumns;
                Ant.frameHeight = Ant.image.height / Ant.numRows;
            };
            Ant.image.src = 'src/assets/ant-frame.png';
        }
        if (!Ant.imageSplash) {
            Ant.imageSplash = new Image();
            // Ant.imageSplash.onload = () => {};
            Ant.imageSplash.src = 'src/assets/ant-splash.png';
        }
    }

    draw() {
        let maxFrame = Ant.numColumns * Ant.numRows - 1;
        if (this.currentFrame > maxFrame) {
            this.currentFrame = 0;
        }
        let column = this.currentFrame % Ant.numColumns;
        let row = Math.floor(this.currentFrame / Ant.numColumns);

        // REBOTE EN X
        if(this.x >= this.maxWidth || this.x <= 0){
            if(this.x <= 0) this.x = 0;
            else this.x = this.maxWidth;
            this.vx = -this.vx;
        }

        // REBOTE EN Y
        if(this.y >= this.maxHeight || this.y <= 0){
            if(this.y <= 0) this.y = 0;
            else this.y = this.maxHeight;
            this.vy = -this.vy;
        }
        //this.vx += ( -5 + (Math.random() * (10)));
        //this.vy += ( -5 + (Math.random() * (10))); 
        
        this.frameCenterX = this.x;
        this.frameCenterY = this.y;

        this.context.translate(this.frameCenterX, this.frameCenterY); //let's translate
        this.context.rotate(Math.PI / 180 * (this.angle + 90)); //increment the angle and rotate the image
        this.context.translate(-this.frameCenterX, -this.frameCenterY);

        this.context.drawImage(Ant.image, column * Ant.frameWidth, row * Ant.frameHeight, Ant.frameWidth, Ant.frameHeight, (this.x - this.radius), this.y - this.radius * 1.42, this.radius * 2, this.radius * 2.42);

        this.context.setTransform(1, 0, 0, 1, 0, 0);


        /*setTimeout(() => {
            
        }, 3000);
        
        if (this.trail.length > 15) {
            //this.trail.shift();
        }
        this.context.fillStyle = '#000000';
        
        this.trail.forEach((point, index) => {
            this.context.beginPath();
            this.context.arc(point.x, point.y, this.mass/2, 0, 2 * Math.PI);
            this.context.fill();
        });
        */
       
        
    }

    update(secondsPassed) {
        this.currentFrame++;
        //Move with velocity x/y
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;

        //this.x += this.vx;
        //this.y += this.vy;

        let angle = Math.atan2(this.vy, this.vx);
        let degrees = 180 * angle / Math.PI;
        this.angle = (360 + Math.round(degrees)) % 360;
    }
}

class GameWorld {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.oldTimeStamp = 0;
        this.gameObjects = [];
        this.deletedAnts = [];
        this.trails = [];
        this.cursorX = 0;
        this.cursorY = 0;
        this.cursorSize = 40;
        this.score = 0;
        this.stop = false;
        this.dead = false;
        this.initialAnts = 30;
        this.maxAnts = 150;
        this.timeNewAnt = 2000; //ms

        this.squashSound = new Audio('src/assets/splash.mp3');
    }

    init(canvasId) {
        this.oldTimeStamp = 0;
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');

        this.canvas.width = window.innerWidth - 10;
        this.canvas.height = window.innerHeight - 80;

        this.cursorX = this.canvas.width / 2;
        this.cursorY = this.canvas.height / 2;

        this.canvas.addEventListener('mousemove', (e) => {
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
        });

        this.canvas.addEventListener('click', () => {
            this.useTool();
        });

        this.createWorld();
        this.autoAddDificult();

        // Request an animation frame for the first time
        // The gameLoop() function will be called as a callback of this request
        window.requestAnimationFrame((timeStamp) => this.gameLoop(timeStamp));
    }

    createWorld() {
        this.gameObjects = [];
        for (var i = 0; i < this.initialAnts; i++) {
            this.createAnt(false);
        }
        setTimeout(()=>{ this.createAnt(true) }, this.timeNewAnt);
    }
    
    createAnt(renew){
        this.gameObjects.push(new Ant(this.canvas, this.context, 0 + (Math.random() * this.canvas.width), 0 + (Math.random() * this.canvas.height), -25 + (Math.random() * 50), -25 + (Math.random() * 50), 15));
        if(renew && !this.stop) setTimeout(()=>{ this.createAnt(true) }, this.timeNewAnt);
    }

    autoAddDificult(){
        this.setDificult(this.timeNewAnt-50);
        if(this.timeNewAnt > 500 && !this.stop) setTimeout(()=>{ this.autoAddDificult(); }, 2500);
    }

    setDificult(newTime){
        this.timeNewAnt = newTime;
        console.log(this.timeNewAnt);
    }

    gameLoop(timeStamp) {

        if(this.stop){
            this.clearCanvas();
            this.drawScore();
            return false;
        }

        // Calculate how much time has passed
        var secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.oldTimeStamp = timeStamp;

        secondsPassed = Math.min(secondsPassed, 0.1);

        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].update(secondsPassed);
        }
        
        this.clearCanvas();

        /*let diameter = 7
        this.context.fillStyle = '#bebebe';
        this.trails.forEach((point, index) => {
            this.context.beginPath();
            this.context.arc(point.x, point.y, diameter, 0, 2 * Math.PI);
            this.context.fill();
        });*/

        this.deletedAnts.forEach((ant, index) => {
            this.context.drawImage(Ant.imageSplash, 0, 0, Ant.imageSplash.width, Ant.imageSplash.height, (ant.x - ant.radius), ant.y - ant.radius * 1.42, ant.radius * 2, ant.radius * 2.42);
        });

        for (var i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].draw();
            
            /*let ax = this.gameObjects[i].x - (Math.random() * this.gameObjects[i].mass);
            let ay = this.gameObjects[i].y - (Math.random() * this.gameObjects[i].mass);
            let newElement = { x: ax, y: ay }
            const isDuplicate = this.trails.some(pos => this.arePositionsClose(pos, newElement, diameter / 2));
            if(!isDuplicate) this.trails.push(newElement);*/
        }

        this.drawTool();
        this.drawScore();

        if(this.gameObjects.length == this.maxAnts){ this.dead = true; this.stop = true; } // FIN DE JUEGO

        // The loop function has reached it's end
        // Keep requesting new frames
        const fps = 30;
        setTimeout(() => { window.requestAnimationFrame((timeStamp) => this.gameLoop(timeStamp)); }, 1000 / fps);
        //window.requestAnimationFrame((timeStamp) => this.gameLoop(timeStamp));
    }

    arePositionsClose(pos1, pos2, radius) {
        const distanceSquared = (pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2;
        return distanceSquared <= radius ** 2;
    }

    drawTool(){
        let mediaCursor = this.cursorSize / 2;
        this.context.strokeStyle = "#FF0000";
        this.context.beginPath();
        this.context.moveTo(this.cursorX - mediaCursor, this.cursorY);
        this.context.lineTo(this.cursorX + mediaCursor, this.cursorY);
        this.context.stroke();
        this.context.beginPath();
        this.context.moveTo(this.cursorX, this.cursorY - mediaCursor);
        this.context.lineTo(this.cursorX, this.cursorY + mediaCursor);
        this.context.stroke();
        this.context.beginPath();
        this.context.arc(this.cursorX, this.cursorY, mediaCursor, 0, Math.PI * 2);
        
        this.context.stroke();
    }

    drawScore(){ 
        if(this.stop){
            let texto = 'Juego finalizado';
            let color = '#000000';
            if(this.dead){
                texto = 'Se ha llenado de hormigas tu pantalla x_x';
                color = '#ff0000';
            }
            this.context.textAlign = "center";
            this.context.font = '30px Arial';
            this.context.fillStyle = color;
            this.context.fillText(texto, this.canvas.width/2, this.canvas.height/2);
            this.context.font = '20px Arial';
            this.context.fillText(`Puntaje: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 30);
        }else{

            this.context.textAlign = "left";
            this.context.fillStyle = '#000000';
            this.context.font = '24px Arial';
            this.context.fillText(`Puntaje: ${this.score}`, 10, 30);
            this.context.textAlign = "right";
            this.context.fillText(`Hormigas restantes: ${this.gameObjects.length}`, this.canvas.width -10, 30);
        }
    }

    useTool() {
        this.gameObjects.forEach((ant, index) => {
            const distance = Math.sqrt(
                Math.pow(this.cursorX - ant.x, 2) + Math.pow(this.cursorY - ant.y, 2)
            );
            if (distance < this.cursorSize / 2 + ant.mass / 2) {
                this.gameObjects.splice(index, 1);
                this.deletedAnts.push(ant);
                this.score++;
                
                if (this.squashSound.currentTime > 0) {
                    this.squashSound.pause();
                    this.squashSound.currentTime = 0;
                }
                this.squashSound.play(); // Reproducir el sonido

                setTimeout(()=>{ this.deletedAnts.shift() }, 10000);
            }
        });
        if(this.gameObjects.length == 0){
            this.stop = true;
        }
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    stopGame(){
        this.stop = true;
    }
}

var gameWorld;
var isOpenInformation = false;
const init = function(canvasId){ gameWorld = new GameWorld(); gameWorld.init(canvasId); }
const detenerJuego = function() { if(gameWorld) gameWorld.stopGame(); }
const reiniciarJuego = function() { detenerJuego(); init('gameCanvas') }
const informacion = function() { 
    if(isOpenInformation) document.querySelector('.sidebar').classList.remove('active');
    else document.querySelector('.sidebar').classList.add('active');
    isOpenInformation = !isOpenInformation;
}
reiniciarJuego();