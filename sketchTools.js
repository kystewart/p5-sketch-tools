/*
 * sketchTools.js — the engine room
 * ================================
 * A little kit that helps you figure out coordinates. Click the canvas to drop points,
 * and ready-to-paste p5.js code (line, triangle, beginShape/vertex...) prints to your
 * browser's developer console.
 *
 * Beginners: you don't need to read this file. You drive it from sketch.js — that's the
 * front door. Aspiring superusers: welcome to the engine room, mind the grease. (Claude
 * was my editor.)
 *
 * HOW IT'S WIRED (the lesson): p5 calls mouseClicked()/keyPressed()/draw() in sketch.js,
 * and those hand off to the sketchTools* functions down below. That's just functions
 * calling functions — the whole point of this week.
 */

// ===== State ================================================================
let clickedPoints = []; // each item is a point: { x, y }
let sketchMode = "lines"; // "lines" | "curves" | "dots"
let usingCurves = false; // connect points with curveVertex instead of vertex?
let showArrays = false; // print x[]/y[] arrays instead of a shape? (great for gradients)
let toolsActive = false; // is the kit turned on? (false = everything below no-ops)

// Where students see "open your console". The hotkey varies by browser/OS, so it lives
// in ONE place you can edit. (Firefox: this opens the Browser Console.)
const CONSOLE_HOTKEY = "Ctrl/Cmd + Shift + J";

// ===== Setup: the functions sketch.js calls in setup() ======================
function enableSketchTools(mode = "lines") {
  toolsActive = true;
  sketchMode = mode;
  usingCurves = mode === "curves";
  updateConsole();
}

// Prints a hello to the dev console. Comment this out in setup() to dismiss it.
function displayWelcomeText() {
  console.log(
    "This is your console. Web Programmers love and hate this thing. " +
      "When your syntax skillz fail you, RTFE: Read the _____ Errors. You'll find them here."
  );
}

// ===== The seams: sketch.js's p5 callbacks hand off to these =================
function sketchToolsClicked() {
  if (!toolsActive || mouseIsOffCanvas()) return;
  // mouseButton is p5's "which button is down". LEFT clicks only.
  if (mouseButton !== LEFT) return;

  clickedPoints.push({ x: round(mouseX), y: round(mouseY) });
  updateConsole();
}

function sketchToolsKey() {
  if (!toolsActive) return;
  // The one place we reach past p5 into plain JavaScript on purpose: if you're typing in
  // a text box, our shortcut keys should butt out. (DOM, not p5 — see MDN: activeElement.)
  if (aTextFieldIsFocused()) return;

  if (keyCode === BACKSPACE || keyCode === DELETE) {
    clickedPoints.pop();
  } else if (key === "c" || key === "C") {
    if (sketchMode !== "dots") usingCurves = !usingCurves;
  } else if (key === "x" || key === "X") {
    clickedPoints = [];
  } else if (key === "a" || key === "A") {
    showArrays = !showArrays;
  } else {
    return; // ignore other keys (so you can keep typing elsewhere)
  }
  updateConsole();
}

// ===== Drawing the preview (sketch.js calls this last in draw()) ============
// Note: sketch.js has no background(), so this happily SMEARS as you move the mouse.
// That's on purpose — it's your first taste of why animations need a background().
function drawSketchTools() {
  if (!toolsActive) return;

  push();
  stroke("black");
  strokeWeight(1);
  noFill();

  if (sketchMode === "dots") {
    for (const p of clickedPoints) circle(p.x, p.y, 5);
  } else if (clickedPoints.length > 0) {
    beginShape();
    if (usingCurves) curveVertex(clickedPoints[0].x, clickedPoints[0].y); // control point
    for (const p of clickedPoints) {
      if (usingCurves) curveVertex(p.x, p.y);
      else vertex(p.x, p.y);
    }
    if (!mouseIsOffCanvas()) {
      if (usingCurves) {
        curveVertex(mouseX, mouseY);
        curveVertex(mouseX, mouseY); // control point
      } else {
        vertex(mouseX, mouseY);
      }
    } else if (usingCurves) {
      const last = clickedPoints[clickedPoints.length - 1];
      curveVertex(last.x, last.y);
    }
    endShape();
  }

  // mark each clicked point
  for (const p of clickedPoints) {
    stroke("white");
    fill("black");
    circle(p.x, p.y, 5);
  }
  pop();
}

// ===== Console output =======================================================
function updateConsole() {
  if (!toolsActive) return;
  console.clear(); // tidy: complex line/curve shapes flood the log fast

  const label = sketchMode === "dots" ? "dots" : usingCurves ? "curves" : "lines";
  console.log("✏️  Sketch tools");
  console.log(`mode: ${label}  ·  points: ${clickedPoints.length}`);
  console.log("keys:  c line/curve · Backspace undo · x clear · a arrays · h HUD");

  if (clickedPoints.length === 0) {
    console.log("Click the canvas to drop points.");
    return;
  }

  // Log the whole snippet as ONE entry so you can copy it in a single click.
  console.log("\n" + generateCode().join("\n"));
}

// Build the lines of code for the current points. Returns an array of strings.
function generateCode() {
  if (sketchMode === "dots") return clickedPoints.map((p) => `circle(${p.x}, ${p.y}, 5);`);
  if (showArrays) return generateArrays();

  const n = clickedPoints.length;
  if (n === 1) return [`point(${pointAt(0)});   // (${pointAt(0)})`];
  if (n === 2) return [`line(${pointAt(0)}, ${pointAt(1)});`];
  if (n === 3 && !usingCurves) return [`triangle(${pointAt(0)}, ${pointAt(1)}, ${pointAt(2)});`];
  return generateShapeBlock();
}

function generateShapeBlock() {
  const vertexFn = usingCurves ? "curveVertex" : "vertex";
  const lines = ["function drawShape() {", "  beginShape();"];
  // with curves, the first/last points repeat as off-screen control points
  if (usingCurves) lines.push(`  curveVertex(${pointAt(0)});  // control point`);
  for (let i = 0; i < clickedPoints.length; i++) lines.push(`  ${vertexFn}(${pointAt(i)});`);
  if (usingCurves) lines.push(`  curveVertex(${pointAt(clickedPoints.length - 1)});  // control point`);
  lines.push("  endShape();", "}");
  return lines;
}

function generateArrays() {
  let xs = clickedPoints.map((p) => p.x);
  let ys = clickedPoints.map((p) => p.y);
  if (usingCurves && xs.length > 0) {
    xs = [xs[0], ...xs, xs[xs.length - 1]];
    ys = [ys[0], ...ys, ys[ys.length - 1]];
  }
  // padStart is plain JavaScript (a String method) — it lines the numbers up in columns.
  const format = (nums) => nums.map((n) => String(n).padStart(3, "0")).join(", ");
  return [`let x = [${format(xs)}];`, `let y = [${format(ys)}];`];
}

// ===== Small helpers ========================================================
function pointAt(i) {
  return `${clickedPoints[i].x}, ${clickedPoints[i].y}`;
}

function mouseIsOffCanvas() {
  return mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height;
}

function aTextFieldIsFocused() {
  const el = document.activeElement;
  return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
}
