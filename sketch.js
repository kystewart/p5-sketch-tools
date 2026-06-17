// sketch.js — YOUR file. Make your masterpiece here.
// The sketch tools (see sketchTools.js) help you find coordinates and hand you
// copy-pasteable p5 code in the console. Open your console to see it.

function setup() {
  createCanvas(600, 600);

  enableSketchTools("lines"); // the toolkit. Comment this out before you submit.
  displayWelcomeText();       // says hi in the console. Comment out to dismiss.

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
  // Notice: there's no background()! That's why things smear when you move the mouse.
  // Add background("yourColor") as the first line here when you're done playing.

  // ...your masterpiece goes here...

  drawSketchTools(); // your points + live preview, drawn on top. Keep me last.
}
