class Sprite {
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.speed = 5;
    }
    
    display() {
        fill(this.color);
        rect(this.x, this.y, this.w, this.h);
    }
    
    move() {
        // define key codes for WASD movement
        let w = 87, a = 65, s = 83, d = 68;
        
        // use a for loop to keep moving sprite until it collides with a platform
        for (let i = 0; i < this.speed; i++) {
            let nextX = this.x;
            let nextY = this.y;
            if (keyIsDown(w)) nextY -= 1;
            if (keyIsDown(a)) nextX -= 1;
            if (keyIsDown(s)) nextY += 1;
            if (keyIsDown(d)) nextX += 1;
            
            if (this.checkForCollisions(nextX, this.y) == false) this.x = nextX;
            if (this.checkForCollisions(this.x, nextY) == false) this.y = nextY;
        }
        // use constrain to keep the sprite in the frame
        this.x = constrain(this.x, 0, width - this.w);
        this.y = constrain(this.y, 0, height - this.h);
    }
    
    checkForCollisions(x, y) {
        for (let platform of platforms) {
            let hit = collideRectRect(x, y, this.w, this.h,
                platform.x, platform.y, platform.w, platform.h)
            if (hit) return true;
        }
        return false;
    }
}

let player = new Sprite(50, 500, 25, 25, "blue");

let platforms = [];

function setup() {
  createCanvas(600, 600);
  
  createConsole("lines");
  
  textAlign(CENTER, CENTER);
  angleMode(DEGREES);
  
  platforms.push(new Sprite(0, 526, 200, 10, "red"));
  platforms.push(new Sprite(300, 526, 200, 10, "red"));
}

function draw() {
  background(220);
 
  player.display();
  player.move();
  
  for (let platform of platforms) {
      platform.display();
  }
  // Don't delete the following or the sketching code breaks
  drawMouseLines("black");
}