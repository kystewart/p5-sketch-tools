/*

Example gradient usage.  Note that gradients are computationally intensive and can slow down your sketch if you have too many steps.

function setup() {
  createCanvas(1000, 600);

  rectGradient(0, 0, width, 200, "magenta", "crimson"); // sky with sunset
  circleGradient(width / 2, 200, 150, "orangeRed", "yellow"); // sun
  circleGradientLinear(300, 200, 100, "black", "sienna", "vertical"); // left round hill
  circleGradientLinear(700, 200, 100, "sienna", "black", "vertical"); // right round hill
  rectGradient(0, 200, width, 400, "green", "black"); // foreground with shadows

  rectGradient(475, 300, 50, 50, color(94, 61, 0), "black", "center"); // foreground square

  vertexGradient([15, 89, 193], [200, 50, 200], 15, 200, "sienna", "black"); // left mountain
  curveVertexGradient([815, 815, 889, 993, 993], [200, 200, 100, 200, 200], 993, 200, "sienna", "black"); // right hill
}

*/

/* 
gets a color in between the startColor and endColor by scaling the values
*/
function getColor(startColor, endColor, val, startVal, endVal) {
  if (typeof startColor === "string") startColor = color(startColor);
  if (typeof endColor === "string") endColor = color(endColor);

  let scaledValue = map(val, startVal, endVal, 0, 1);
  let thisColor = lerpColor(startColor, endColor, scaledValue);
  return thisColor;
}

/*
draws a rectangle with a horizontal gradient, going from startColor at top to endColor to bottom
parameters:
 x = x of upper left corner
 y = y of upper left corner
 w = width of rectangle
 h = height of rectangle
 startColor = color at top/left/outside of rectangle
 endColor = color at bottom/right/inside of rectangle
 direction = "horizontal", "vertical", or "center"
*/
function rectGradient(x, y, w, h, startColor, endColor, direction = "horizontal", numSteps = 100) {
  push();
  noStroke();
  if (direction.toLowerCase().includes("h")) {
    numSteps = min(numSteps, h * 2);
    for (let i = 0; i < numSteps; i += 1) {
      let stepSize = h / numSteps;
      let thisY = y + i * stepSize;
      let thisColor = getColor(startColor, endColor, thisY, y, y + h);
      fill(thisColor);
      rect(x, thisY, w, stepSize);
    }
  } else if (direction.toLowerCase().includes("v")) {
    numSteps = min(numSteps, w * 2);
    for (let i = 0; i < numSteps; i += 1) {
      let stepSize = w / numSteps;
      let thisX = x + i * stepSize;
      let thisColor = getColor(startColor, endColor, thisX, x, x + w);
      fill(thisColor);
      rect(thisX, y, stepSize, h);
    }
  } else {
    numSteps = min(numSteps, min(w, h) * 2);

    for (let i = 0; i < numSteps; i += 1) {
      let xStepSize = w / 2 / numSteps;
      let yStepSize = h / 2 / numSteps;
      let thisX = x + i * xStepSize;
      let thisY = y + i * yStepSize;
      let thisW = w - i * xStepSize * 2;
      let thisH = h - i * yStepSize * 2;
      let thisColor = getColor(startColor, endColor, i, 0, numSteps);
      fill(thisColor);
      rect(thisX, thisY, thisW, thisH);
    }

  }
  pop();
}

/*
draws a circle with a radial gradient, going from startColor at outside to endColor on inside
parameters:
  x = x of circle center
  y = y of circle center
  diameter = diameter of circle
  outerColor = outside color of circle
  innerColor = inside color of circle
  innerDiameter = diameter of inside circle (default is 0 so it goes to the center)
  numSteps = number of steps to take in drawing the gradient
*/
function circleGradient(x, y, diameter, outerColor, innerColor, innerDiameter = 0, numSteps = 100) {
  push();
  noStroke();
  numSteps = min(numSteps, (diameter - innerDiameter) * 2);
  let stepSize = (diameter - innerDiameter) / numSteps;
  for (let i = 0; i < numSteps; i += 1) {
    let thisD = diameter - i * stepSize;
    let thisColor = getColor(outerColor, innerColor, thisD, diameter, innerDiameter);
    fill(thisColor);
    circle(x, y, thisD);
  }
  pop();
}

/* draws a circle with a linear gradient, going from startColor
parameters:
 x = x of circle center
 y = y of circle center
 diameter = diameter of circle
 startColor = color at left/top of circle
 endColor = color at right/bottom of circle
 direction = "horizontal" or "vertical"
*/
function circleGradientLinear(x, y, diameter, startColor, endColor, direction = "horizontal") {
  push();
  strokeWeight(1);
  let radius = diameter / 2;
  for (let thisR = -radius; thisR <= radius; thisR += 0.5) {
    let thisColor = getColor(startColor, endColor, thisR, -radius, radius);
    stroke(thisColor);
    if (direction.toLowerCase().includes("horizontal")) {
      let thisWidth = sqrt(radius ** 2 - thisR ** 2);
      line(x - thisWidth, y + thisR, x + thisWidth, y + thisR);
    }
    else {
      let thisHeight = sqrt(radius ** 2 - thisR ** 2);
      line(x + thisR, y - thisHeight, x + thisR, y + thisHeight);
    }
  }
  pop();
}

/*
draws a shape made of a list of vertices, going from startColor at outside to endColor at the centerX, centerY
parameters:
  x = array of x vertices in square brackets e.g. [1, 2, 3]
  y = array of y vertices in square brackets e.g. [100, 200, 300]
  centerX = x value of the center of the shape
  centerY = y value of the center of the shape
  startColor = outside color of shape
  endColor = inside color of shape
  center = "point", "horizontal", or "vertical"
*/
function vertexGradient(x, y, centerX, centerY, startColor, endColor, center = "point") {

  push();
  noStroke();
  for (let thisScale = 1; thisScale > 0; thisScale -= 0.01) {
    push();
    let thisColor = getColor(startColor, endColor, thisScale, 1, 0);
    fill(thisColor);

    translate(centerX, centerY);
    if (center == "point") scale(thisScale);
    else if (center == "horizontal") scale(1, thisScale);
    else scale(thisScale, 1);
    translate(-1 * centerX, -1 * centerY);

    beginShape();
    for (let i = 0; i < x.length; i++) {
      vertex(x[i], y[i]);
    }
    endShape();
    pop();
  }
  pop();
}

/*
draws a shape made of a list of curve vertices, going from startColor at outside to endColor at the centerX, centerY
parameters:
  x = array of x vertices in square brackets e.g. [1, 2, 3]
  y = array of y vertices in square brackets e.g. [100, 200, 300]
  centerX = x value of the center of the shape
  centerY = y value of the center of the shape
  startColor = outside color of shape
  endColor = inside color of shape
  center = "point", "horizontal", or "vertical"
*/
function curveVertexGradient(x, y, centerX, centerY, startColor, endColor, center = "point") {

  push();
  noStroke();

  for (let thisScale = 1; thisScale > 0; thisScale -= 0.01) {
    push();
    let thisColor = getColor(startColor, endColor, thisScale, 1, 0);
    fill(thisColor);

    translate(centerX, centerY);
    if (center == "point") scale(thisScale);
    else if (center == "horizontal") scale(1, thisScale);
    else scale(thisScale, 1);
    translate(-1 * centerX, -1 * centerY);
    beginShape();
    for (let i = 0; i < x.length; i++) {
      curveVertex(x[i], y[i]);
    }
    endShape();
    pop();
  }
  pop();
}