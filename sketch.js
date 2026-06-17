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
  // background("chartreuse"); // <- uncomment for a clean canvas. (chartreuse is a
  // yellow-green color, named after a French liqueur. Try any color name you like!)

  // 1. YOUR NAME — change "your name here" to the name you want to be called
  textSize(40);
  fill("black");
  text("your name here", 60, 70);

  // 2. YOUR PICTURES — trace shapes with the sketch tools, paste each one below as its
  //    OWN function. Functions DO things, so name them with a VERB that says what they
  //    draw (like drawFlowerPetals or drawSun). Then call the function here, e.g.:
  drawBlackHoleSun();

  // 3. YOUR MOTTO — a few words that matter to you right now
  // text("your motto here", 60, 560);

  drawSketchTools(); // your points + live preview, drawn on top. Keep me last.
}

// Example shape function. The name is a VERB phrase — it says what it DOES. And look at
// those color names: razzmatazz, orchid... not "purple"! 😉  Replace it with your own.
function drawBlackHoleSun() {
  let razzmatazz = "#ac05f8";
  let midnight = "#373777";
  fill(razzmatazz);
  stroke(midnight);
  strokeWeight(3);

  beginShape();
  vertex(461, 50);
  vertex(403, 81);
  vertex(424, 130);
  vertex(413, 198);
  vertex(498, 170);
  vertex(557, 196);
  vertex(557, 124);
  vertex(594, 69);
  vertex(531, 43);
  vertex(492, 1);
  endShape(CLOSE);

  fill("orchid");
  circle(500, 100, 100);
}
