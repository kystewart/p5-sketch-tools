// sketch.js — YOUR file. Make your masterpiece here.
// The sketch tools (see sketchTools.js) help you find coordinates and hand you
// copy-pasteable p5 code in the console. Open your console to see it.

function setup() {
  createCanvas(600, 600);

  enableSketchTools("lines"); // the toolkit. Comment this out before you submit.
  displayWelcomeText();       // says hi in the console. Comment out to dismiss.

  // describe("a logo with my name, pictures, and motto"); // optional: describe your
  // logo in your own words so screen readers can share it.

  noLoop(); // the canvas sits still for now — DELETE this line if your sketch animates.
}

function mouseClicked(event) {
  loop();                    // wake the sketch so the preview follows your mouse
  sketchToolsClicked(event); // record the click — it's not magic, it's sketchTools.js
}

function keyPressed() {
  sketchToolsKey(); // c = line/curve, Backspace = undo, x = clear, a = arrays
}

function draw() {
  // background("skyblue"); // <- uncomment for a clean canvas (and to stop the smear!)

  // 1. YOUR NAME — change "your name here" to the name you want to be called
  textSize(40);
  fill("black");
  text("your name here", 60, 70);

  // 2. YOUR PICTURES — trace shapes with the sketch tools, paste each one below as its
  //    OWN function, and NAME the function after what it draws (like flowerPetals or sun).
  //    Then call it here. For example:
  sun();

  // 3. YOUR MOTTO — a few words that matter to you right now
  // text("your motto here", 60, 560);

  drawSketchTools(); // your points + live preview, drawn on top. Keep me last.
}

// Example shape function — see how the name says what it draws? Replace it with your own.
function sun() {
  fill("gold");
  noStroke();
  circle(490, 80, 70);
}
