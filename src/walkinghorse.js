(function(canvasId, src, numColumns, numRows, initialFrame, autorun) {
    let image = new Image();
    //let numColumns = 3;
    //let numRows = 1;
    let frameWidth = 0;
    let frameHeight = 0;
    let currentFrame = initialFrame ?? 0;
    let maxFrame = numColumns * numRows - 1;
    let canvas;
    let context;
    let radius = 50;
    let x = 50;
    let y = 50;
    let fps = 12;
    let vx = 10;

    const draw = (next) => {
        
        if (currentFrame > maxFrame) {
            currentFrame = 0;
        }

        x-=vx;
        if(x < 0) x = canvas.width;

        let column = currentFrame % numColumns;
        let row = Math.floor(currentFrame / numColumns);

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, column * frameWidth, row * frameHeight, frameWidth, frameHeight, (x - radius/2), (y - radius/2), radius, radius);
        currentFrame++;

        if(next) setTimeout(() => { window.requestAnimationFrame(() => draw(next)); }, 1000 / fps);
    }

    image.onload = () => {
        //Define the size of a frame
        frameWidth = image.width / numColumns;
        frameHeight = image.height / numRows;

        canvas = document.getElementById(canvasId);
        context = canvas.getContext('2d');


        canvas.width = window.innerWidth;
        canvas.height = 50;
        let press = false;
        
        document.addEventListener('keydown', function(event) {
            if(event.key == 'ArrowLeft' && !press){
                press = true
                for (let n = 0; n <= maxFrame; n++) {
                    setTimeout(() => { draw(false) }, n*100);
                }
            }
        });

        document.addEventListener('keyup', function (event) {
            if(event.key == 'ArrowLeft') press = false;
        });

        x = canvas.width/2;
        y = canvas.height/2;

        draw(autorun);
    };
    image.src = src;
})('canvas2','src/assets/horse.png', 3, 1, 2, true);