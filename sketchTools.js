/*
 * sketchTools.js
 * Copyright (c) 2026 Kyle Stewart — MIT License
 *
 * Free for anyone who also finds it useful — use it, remix it, teach with it.
 * If you like it and use it, please buy me a coffee (or a Ferrari, if your budget
 * allows): https://buymeacoffee.com/kystewart
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
 * calling functions — functions are perhaps THE core CS skill.
 */

// ===== State ================================================================
let clickedPoints = []; // an array of point objects like { x: 40, y: 90 } (little structs)
let sketchMode = "lines"; // "lines" | "curves" | "dots"
let usingCurves = false; // connect points with curveVertex instead of vertex?
let showArrays = false; // print x[]/y[] arrays instead of a shape? (great for gradients)
let toolsActive = false; // is the kit turned on? (false = everything below no-ops)

let hud; // the HUD panel (a p5 DOM element), built on demand
let hudVisible = false; // is the HUD showing right now?

let fillPicker, strokePicker; // p5 color pickers
let fillNameInput, strokeNameInput; // text fields for naming each color
let weightInput; // stroke-weight stepper (a number input)
let noFillBox, noStrokeBox; // checkboxes

// Where students see "open your console". The hotkey varies by browser/OS, so it lives
// in ONE place you can edit. (Firefox: this opens the Browser Console.)
const CONSOLE_HOTKEY = "Ctrl/Cmd + Shift + J";

// ===== Setup: the functions sketch.js calls in setup() ======================
function enableSketchTools(mode = "lines") {
  toolsActive = true;
  sketchMode = mode;
  usingCurves = mode === "curves";
  buildHud();
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
function sketchToolsClicked(event) {
  if (!toolsActive) return;
  // Clicks that land on the HUD belong to the HUD (its pickers/buttons), not the canvas.
  if (clickLandedOnHud(event)) return;
  if (mouseIsOffCanvas() || mouseButton !== LEFT) return; // canvas, left button only

  clickedPoints.push({ x: round(mouseX), y: round(mouseY) });
  if (hudVisible) hideHud(); // your first canvas click tucks the HUD away
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
  } else if (key === "h" || key === "H") {
    toggleHud();
    return; // toggling the HUD doesn't change the printed code
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
  applyCurrentStyle(); // draw the preview in the colors/weight you picked in the HUD

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

  // mark each clicked point (skip in dots mode — the styled circles already show them)
  if (sketchMode !== "dots") {
    for (const p of clickedPoints) {
      stroke("white");
      fill("black");
      strokeWeight(1);
      circle(p.x, p.y, 5);
    }
  }
  pop();
}

// ===== The HUD (tips + controls, floating over the canvas) ==================
// The HUD is built from p5's DOM widgets. It floats ABOVE the canvas — and that layering
// is itself a little superuser lesson (the controls live in the page, not in your
// drawing). It shows by default so it's obvious the tools are on (turn them off before you
// submit!), and it hides on your first click or when you press h.
function buildHud() {
  if (hud) return; // only ever build it once

  hud = createDiv();
  hud.style("position", "absolute");
  hud.style("box-sizing", "border-box");
  hud.style("max-width", "300px");
  hud.style("padding", "10px 12px");
  hud.style("background", "rgba(20, 20, 28, 0.88)");
  hud.style("color", "#f0f0f0");
  hud.style("font", "13px/1.45 system-ui, sans-serif");
  hud.style("border-radius", "8px");
  hud.style("box-shadow", "0 2px 12px rgba(0, 0, 0, 0.35)");
  hud.style("z-index", "10");

  createDiv(
    "<b>Sketch tools are ON.</b> (turn them off before you submit!)<br>" +
      "Open your dev tools (<code>" + CONSOLE_HOTKEY + "</code>, or Tools ▸ Browser Tools) to see your code.<br><br>" +
      "Click the canvas to start and I'll duck out of your way — press <code>h</code> to bring me back.<br><br>" +
      "<b>keys:</b> c line/curve · Backspace undo · x clear · a arrays · h hide/show<br><br>" +
      "Tracing polygons &amp; curves here is great. For circles &amp; rectangles, use " +
      "<code>circle()</code> / <code>rect()</code> instead — they look way better.<br><br>" +
      "<i>Notice there's no background() yet — that's why it smears. Add one in draw() " +
      "when you're done playing.</i>"
  ).parent(hud);

  // --- interactive controls (the only clickable bits) ---
  const controls = createDiv();
  controls.style("margin-top", "10px");
  controls.style("padding-top", "8px");
  controls.style("border-top", "1px solid rgba(255,255,255,0.2)");
  controls.parent(hud);

  fillPicker = createColorPicker("#ff8c42");
  fillPicker.changed(updateConsole);
  fillNameInput = createInput("");
  fillNameInput.attribute("placeholder", "fill name");
  fillNameInput.style("width", "92px");
  fillNameInput.changed(() => onNameChanged("fill"));
  noFillBox = createCheckbox("noFill", false);
  noFillBox.changed(updateConsole);

  strokePicker = createColorPicker("#1b1b3a");
  strokePicker.changed(updateConsole);
  strokeNameInput = createInput("");
  strokeNameInput.attribute("placeholder", "stroke name");
  strokeNameInput.style("width", "92px");
  strokeNameInput.changed(() => onNameChanged("stroke"));
  noStrokeBox = createCheckbox("noStroke", false);
  noStrokeBox.changed(updateConsole);

  weightInput = createInput("1", "number");
  weightInput.attribute("min", "1");
  weightInput.attribute("step", "1");
  weightInput.style("width", "60px");
  weightInput.changed(updateConsole);

  const fillRow = hudRow(controls, "Fill");
  fillPicker.parent(fillRow);
  fillNameInput.parent(fillRow);
  noFillBox.parent(fillRow);

  const strokeRow = hudRow(controls, "Stroke");
  strokePicker.parent(strokeRow);
  strokeNameInput.parent(strokeRow);
  noStrokeBox.parent(strokeRow);

  const weightRow = hudRow(controls, "Weight");
  weightInput.parent(weightRow);

  showHud();
}

// Put the HUD over the canvas's top-left corner. (getBoundingClientRect is plain DOM:
// figuring out where something sits on screen is a browser job, not a p5 one.)
function positionHud() {
  const canvas = select("canvas");
  if (!canvas || !hud) return;
  const box = canvas.elt.getBoundingClientRect();
  hud.position(box.left + window.scrollX + 12, box.top + window.scrollY + 12);
}

function showHud() {
  if (!hud) return;
  positionHud();
  hud.show();
  hudVisible = true;
}

function hideHud() {
  if (!hud) return;
  hud.hide();
  hudVisible = false;
}

function toggleHud() {
  if (hudVisible) hideHud();
  else showHud();
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
  maybeNudge();
}

// Build the lines of code for the current points. Returns a list of code lines.
function generateCode() {
  // arrays mode feeds the gradient functions — colors don't apply there
  if (showArrays) return generateArrays();

  if (sketchMode === "dots") {
    let lines = [];
    for (let i = 0; i < clickedPoints.length; i++) {
      lines.push("circle(" + pointAt(i) + ", 5);");
    }
    return withStyle(true, true, lines);
  }

  let count = clickedPoints.length;
  if (count === 1) {
    return withStyle(false, true, ["point(" + pointAt(0) + ");"]);
  }
  if (count === 2) {
    return withStyle(false, true, ["line(" + pointAt(0) + ", " + pointAt(1) + ");"]);
  }
  if (count === 3 && !usingCurves) {
    return withStyle(true, true, ["triangle(" + pointAt(0) + ", " + pointAt(1) + ", " + pointAt(2) + ");"]);
  }
  return withStyle(true, true, generateShapeBlock());
}

// Add the fill/stroke/strokeWeight lines (using your named colors) above a shape.
// usesFill / usesStroke say which styles the shape cares about (a line has no fill).
function withStyle(usesFill, usesStroke, shapeLines) {
  if (!fillPicker || !strokePicker) return shapeLines; // HUD not built (tools off)

  let fillName = colorVarName("fill");
  let strokeName = colorVarName("stroke");
  let lines = [];

  // declare the color variables first — this is exactly why naming them matters
  if (usesFill && !noFillBox.checked()) {
    lines.push("let " + fillName + ' = "' + fillPicker.value() + '";');
  }
  if (usesStroke && !noStrokeBox.checked()) {
    lines.push("let " + strokeName + ' = "' + strokePicker.value() + '";');
  }

  // then turn the styles on
  if (usesFill) {
    if (noFillBox.checked()) lines.push("noFill();");
    else lines.push("fill(" + fillName + ");");
  }
  if (usesStroke) {
    if (noStrokeBox.checked()) {
      lines.push("noStroke();");
    } else {
      lines.push("stroke(" + strokeName + ");");
      lines.push("strokeWeight(" + currentWeight() + ");");
    }
  }

  if (lines.length > 0) lines.push(""); // blank line before the shape

  // finally, add the shape itself
  for (let i = 0; i < shapeLines.length; i++) {
    lines.push(shapeLines[i]);
  }
  return lines;
}

function generateShapeBlock() {
  let lines = [];
  lines.push("function drawShape() {");
  lines.push("  beginShape();");

  // with curves, the first and last points repeat as off-screen control points
  if (usingCurves) {
    lines.push("  curveVertex(" + pointAt(0) + ");  // control point");
  }

  for (let i = 0; i < clickedPoints.length; i++) {
    if (usingCurves) {
      lines.push("  curveVertex(" + pointAt(i) + ");");
    } else {
      lines.push("  vertex(" + pointAt(i) + ");");
    }
  }

  if (usingCurves) {
    let last = clickedPoints.length - 1;
    lines.push("  curveVertex(" + pointAt(last) + ");  // control point");
  }

  lines.push("  endShape();");
  lines.push("}");
  return lines;
}

function generateArrays() {
  let xs = [];
  let ys = [];

  // (curves repeat the first and last points as control points)
  if (usingCurves && clickedPoints.length > 0) {
    xs.push(clickedPoints[0].x);
    ys.push(clickedPoints[0].y);
  }
  for (let i = 0; i < clickedPoints.length; i++) {
    xs.push(clickedPoints[i].x);
    ys.push(clickedPoints[i].y);
  }
  if (usingCurves && clickedPoints.length > 0) {
    let last = clickedPoints.length - 1;
    xs.push(clickedPoints[last].x);
    ys.push(clickedPoints[last].y);
  }

  return ["let x = [" + numberList(xs) + "];", "let y = [" + numberList(ys) + "];"];
}

// Join numbers with commas, each padded to 3 digits so the columns line up.
function numberList(nums) {
  let out = "";
  for (let i = 0; i < nums.length; i++) {
    if (i > 0) out += ", ";
    out += String(nums[i]).padStart(3, "0");
  }
  return out;
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

// Did this click land on the HUD panel or its controls? Then it's the HUD's click, not a
// canvas click. (event.target + .contains are plain DOM — same seam idea as the key guard.)
function clickLandedOnHud(event) {
  return hud && event && event.target && hud.elt.contains(event.target);
}

// ===== HUD/control helpers ==================================================
// One labeled row of controls inside the HUD.
function hudRow(parent, labelText) {
  const row = createDiv();
  row.style("display", "flex");
  row.style("align-items", "center");
  row.style("gap", "8px");
  row.style("margin-top", "8px");
  if (labelText) {
    const label = createSpan(labelText);
    label.parent(row);
    label.style("min-width", "48px");
  }
  row.parent(parent);
  return row;
}

// Paint the preview in the styles currently chosen in the HUD.
function applyCurrentStyle() {
  if (noStrokeBox && noStrokeBox.checked()) {
    noStroke();
  } else {
    stroke(strokePicker ? strokePicker.value() : "black");
    strokeWeight(currentWeight());
  }
  if (noFillBox && noFillBox.checked()) {
    noFill();
  } else {
    fill(fillPicker ? fillPicker.value() : "black");
  }
}

function currentWeight() {
  const w = weightInput ? parseInt(weightInput.value(), 10) : 1;
  return isNaN(w) || w < 1 ? 1 : w; // clamp: a number box happily accepts junk
}

// Read a color-name field and turn it into a safe variable name for the code.
function colorVarName(which) {
  const input = which === "fill" ? fillNameInput : strokeNameInput;
  const fallback = which === "fill" ? "fillColor" : "strokeColor";
  return sanitizeName(input ? input.value() : "", fallback);
}

// Make a legal JavaScript variable name out of whatever the student typed.
function sanitizeName(raw, fallback) {
  let s = (raw || "").replace(/[^a-zA-Z0-9 ]/g, " "); // illegal chars -> spaces
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;
  let name =
    words[0].toLowerCase() +
    words.slice(1).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
  name = name.replace(/^[0-9]+/, ""); // names can't start with a digit
  if (name === "") return fallback;
  // don't let them shadow the p5 functions we're about to call
  const reserved = ["fill", "stroke", "strokeWeight", "noFill", "noStroke", "color"];
  if (reserved.includes(name)) name = "my" + name[0].toUpperCase() + name.slice(1);
  return name;
}

// When a name field loses focus, clean it up — and pop a (self-demonstrating) warning.
function onNameChanged(which) {
  const input = which === "fill" ? fillNameInput : strokeNameInput;
  const fallback = which === "fill" ? "fillColor" : "strokeColor";
  const raw = input.value().trim();
  const clean = sanitizeName(raw, fallback);
  if (raw !== "" && clean !== raw) {
    input.value(clean);
    // The warning message obeys the rule it's teaching. (alert is plain JavaScript.)
    alert("pleaseUseCamelCaseForAllVariableNamesSinceSpacesAreIllegal\n\n→ using: " + clean);
  }
  updateConsole();
}

// Gentle ribbing printed under the snippet.
function maybeNudge() {
  if (showArrays || sketchMode === "dots" || !fillPicker) return;
  const fillName = colorVarName("fill");
  const strokeName = colorVarName("stroke");
  const noFillOn = noFillBox.checked();
  const noStrokeOn = noStrokeBox.checked();

  if (!noFillOn && !noStrokeOn && fillName === strokeName) {
    console.log(`💡 Same name ("${fillName}") for fill and stroke? Maybe you want noStroke().`);
  }
  const boring = ["red", "green", "blue", "black", "white"];
  if (!noFillOn && boring.includes(fillName.toLowerCase()))
    console.log(`🙄 "${fillName}"? Bold choice, Picasso.`);
  if (!noStrokeOn && boring.includes(strokeName.toLowerCase()))
    console.log(`🙄 "${strokeName}"? Living dangerously, I see.`);
}
